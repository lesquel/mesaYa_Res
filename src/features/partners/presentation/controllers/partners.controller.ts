/**
 * Partners Controller
 *
 * REST API for B2B partner webhook registration and management.
 * Implements HMAC-SHA256 authentication for secure webhook delivery.
 *
 * Endpoints:
 * - POST /partners/register - Register new partner with webhook URL
 * - GET /partners - List all partners
 * - GET /partners/:id - Get partner details
 * - PATCH /partners/:id - Update partner
 * - DELETE /partners/:id - Remove partner
 * - POST /partners/:id/regenerate-secret - Generate new HMAC secret
 * - POST /partners/verify-webhook - Verify webhook signature (utility)
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ConflictException,
  NotFoundException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PartnerRepository } from '../../infrastructure/persistence/partner.repository';
import { HmacWebhookService } from '../../application/services/hmac-webhook.service';
import {
  RegisterPartnerDto,
  UpdatePartnerDto,
  PartnerResponseDto,
  PartnerRegisteredResponseDto,
  RegenerateSecretResponseDto,
  VerifyWebhookDto,
  PartnerStatusDto,
} from '../dto/partner.dto';
import {
  PartnerEntity,
  PartnerStatus,
} from '../../domain/entities/partner.entity';

@ApiTags('Partners - B2B Webhooks')
@ApiBearerAuth()
@Controller({ path: 'partners', version: '1' })
export class PartnersController {
  private readonly logger = new Logger(PartnersController.name);

  constructor(
    private readonly partnerRepository: PartnerRepository,
    private readonly hmacService: HmacWebhookService,
  ) {}

  /**
   * Register a new B2B partner for webhook integration
   */
  @Post('register')
  @ApiOperation({
    summary: 'Register new partner',
    description:
      'Register a B2B partner to receive webhook events. Returns HMAC secret - store securely!',
  })
  @ApiResponse({
    status: 201,
    description: 'Partner registered successfully',
    type: PartnerRegisteredResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Partner name already exists' })
  async register(
    @Body() dto: RegisterPartnerDto,
  ): Promise<PartnerRegisteredResponseDto> {
    // Check for duplicate name
    const exists = await this.partnerRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(
        `Partner with name '${dto.name}' already exists`,
      );
    }

    const partner = await this.partnerRepository.create({
      name: dto.name,
      webhookUrl: dto.webhookUrl,
      events: dto.events,
      description: dto.description,
      contactEmail: dto.contactEmail,
    });

    this.logger.log(`Partner registered: ${partner.name} (${partner.id})`);

    return {
      ...this.toResponseDto(partner),
      secret: partner.secret, // Only returned on creation!
    };
  }

  /**
   * Get all registered partners
   * Supports filtering by subscribed event and status
   */
  @Get()
  @ApiOperation({
    summary: 'List all partners',
    description: 'Returns all registered B2B partners. Can filter by subscribed event and status.',
  })
  @ApiQuery({
    name: 'subscribedEvent',
    required: false,
    description: 'Filter by subscribed event type (e.g., payment.created, payment.succeeded)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended'],
    description: 'Filter by partner status',
  })
  @ApiResponse({ status: 200, type: [PartnerResponseDto] })
  async findAll(
    @Query('subscribedEvent') subscribedEvent?: string,
    @Query('status') status?: string,
  ): Promise<PartnerResponseDto[]> {
    this.logger.log(
      `Fetching partners - subscribedEvent: ${subscribedEvent || 'any'}, status: ${status || 'any'}`,
    );

    let partners: PartnerEntity[];

    // Filter by subscribed event if provided
    if (subscribedEvent) {
      partners = await this.partnerRepository.findByEventSubscription(subscribedEvent);
      this.logger.log(`Found ${partners.length} partners subscribed to ${subscribedEvent}`);
    } else if (status === 'active') {
      partners = await this.partnerRepository.findAllActive();
    } else {
      partners = await this.partnerRepository.findAll();
    }

    // Additional status filter if both params provided
    if (subscribedEvent && status === 'active') {
      partners = partners.filter((p) => p.status === 'ACTIVE');
    }

    this.logger.log(`Returning ${partners.length} partners`);
    return partners.map((p) => this.toResponseDto(p));
  }

  /**
   * Get partner by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get partner details' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    const partner = await this.partnerRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`Partner with ID '${id}' not found`);
    }
    return this.toResponseDto(partner);
  }

  /**
   * Update partner configuration
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update partner' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ): Promise<PartnerResponseDto> {
    // Check for name conflict if updating name
    if (dto.name) {
      const existing = await this.partnerRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Partner with name '${dto.name}' already exists`,
        );
      }
    }

    const partner = await this.partnerRepository.update(id, {
      ...dto,
      status: dto.status as PartnerStatus | undefined,
    });
    if (!partner) {
      throw new NotFoundException(`Partner with ID '${id}' not found`);
    }

    this.logger.log(`Partner updated: ${partner.name} (${partner.id})`);
    return this.toResponseDto(partner);
  }

  /**
   * Delete partner registration
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete partner' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 204, description: 'Partner deleted' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const deleted = await this.partnerRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Partner with ID '${id}' not found`);
    }
    this.logger.log(`Partner deleted: ${id}`);
  }

  /**
   * Regenerate HMAC secret for partner
   */
  @Post(':id/regenerate-secret')
  @ApiOperation({
    summary: 'Regenerate HMAC secret',
    description:
      'Generate new webhook signing secret. Old secret is invalidated immediately.',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: RegenerateSecretResponseDto })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async regenerateSecret(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RegenerateSecretResponseDto> {
    const result = await this.partnerRepository.regenerateSecret(id);
    if (!result) {
      throw new NotFoundException(`Partner with ID '${id}' not found`);
    }

    this.logger.log(`Secret regenerated for partner: ${result.partner.name}`);

    return {
      secret: result.newSecret,
      partner: this.toResponseDto(result.partner),
    };
  }

  /**
   * Utility endpoint to verify webhook signature
   * Partners can use this to test their signature verification implementation
   */
  @Post(':id/verify-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify webhook signature',
    description:
      'Test endpoint for partners to verify their signature verification implementation',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Signature verification result' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async verifyWebhook(
    @Param('id', ParseUUIDPipe) partnerId: string,
    @Body() dto: VerifyWebhookDto,
  ): Promise<{ valid: boolean; message: string }> {
    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const result = this.hmacService.verifySignature(
      dto.signature,
      dto.payload,
      partner.secret,
    );

    return {
      valid: result.valid,
      message: result.valid
        ? 'Signature is valid'
        : result.error || 'Invalid signature',
    };
  }

  /**
   * Get available webhook events
   */
  @Get('events/available')
  @ApiOperation({ summary: 'List available webhook events' })
  @ApiResponse({ status: 200 })
  getAvailableEvents(): { events: string[]; description: string }[] {
    return [
      // Reservation events
      {
        events: ['reservation.created'],
        description: 'New reservation created',
      },
      {
        events: ['reservation.confirmed'],
        description: 'Reservation confirmed by restaurant',
      },
      {
        events: ['reservation.cancelled'],
        description: 'Reservation cancelled',
      },
      {
        events: ['reservation.completed'],
        description: 'Reservation completed (checked out)',
      },
      {
        events: ['reservation.no_show'],
        description: 'Customer did not show up',
      },
      { events: ['reservation.*'], description: 'All reservation events' },
      // Payment events
      { events: ['payment.initiated'], description: 'Payment process started' },
      { events: ['payment.completed'], description: 'Payment successful' },
      { events: ['payment.failed'], description: 'Payment failed' },
      { events: ['payment.refunded'], description: 'Payment refunded' },
      { events: ['payment.*'], description: 'All payment events' },
      // Restaurant events
      {
        events: ['restaurant.updated'],
        description: 'Restaurant details updated',
      },
      {
        events: ['table.availability_changed'],
        description: 'Table availability changed',
      },
      // Universal
      { events: ['*'], description: 'All events (wildcard)' },
    ];
  }

  private toResponseDto(partner: PartnerEntity): PartnerResponseDto {
    return {
      id: partner.id,
      name: partner.name,
      webhookUrl: partner.webhookUrl,
      status: partner.status as PartnerStatusDto,
      events: partner.events,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}
