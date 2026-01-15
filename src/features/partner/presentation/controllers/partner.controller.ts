/**
 * Partner Controller
 *
 * REST API endpoints for B2B partner management.
 * Handles partner registration, updates, and webhook testing.
 *
 * Base URL: /api/v1/partners
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  PartnerService,
  WebhookDispatcherService,
} from '../../application/services';
import type { Partner } from '../../domain';
import {
  RegisterPartnerDto,
  UpdatePartnerDto,
  PartnerResponseDto,
  PartnerRegistrationResponseDto,
  SendTestWebhookDto,
} from '../dto/partner.dto';

@ApiTags('Partners - B2B Webhooks')
@ApiBearerAuth()
@Controller({ path: 'partners', version: '1' })
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly webhookDispatcher: WebhookDispatcherService,
  ) {}

  /**
   * Register a new B2B partner
   *
   * POST /api/v1/partners/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new partner',
    description: `
      Registers a new B2B partner to receive webhooks from MesaYA.

      **IMPORTANT**: The secret returned in the response should be stored securely.
      It will only be shown once and is required to verify incoming webhooks.

      ## Webhook Format

      All webhooks sent to partners include these headers:
      - \`X-Webhook-Signature\`: HMAC-SHA256 signature
      - \`X-Webhook-Timestamp\`: ISO 8601 timestamp
      - \`X-Webhook-Algorithm\`: Always "HMAC-SHA256"

      ## Signature Verification

      To verify webhooks:
      1. Concatenate: \`{timestamp}.{raw_body}\`
      2. Compute HMAC-SHA256 using your secret
      3. Compare with X-Webhook-Signature header
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Partner registered successfully',
    type: PartnerRegistrationResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Partner name already exists' })
  async registerPartner(
    @Body() dto: RegisterPartnerDto,
  ): Promise<PartnerRegistrationResponseDto> {
    const result = await this.partnerService.registerPartner(dto);

    return {
      ...this.mapToResponse(result.partner),
      secret: result.secret,
    };
  }

  /**
   * Get all partners
   *
   * GET /api/v1/partners
   */
  @Get()
  @ApiOperation({
    summary: 'List all partners',
    description: 'Returns all registered B2B partners',
  })
  @ApiResponse({
    status: 200,
    description: 'List of partners',
    type: [PartnerResponseDto],
  })
  async getAllPartners(): Promise<PartnerResponseDto[]> {
    const partners = await this.partnerService.getAllPartners();
    return partners.map((p) => this.mapToResponse(p));
  }

  /**
   * Get partner by ID
   *
   * GET /api/v1/partners/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get partner by ID',
    description: 'Returns details of a specific partner',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async getPartnerById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    const partner = await this.partnerService.getPartnerById(id);

    if (!partner) {
      throw new NotFoundException(`Partner not found: ${id}`);
    }

    return this.mapToResponse(partner);
  }

  /**
   * Update partner
   *
   * PATCH /api/v1/partners/:id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update partner',
    description: 'Update partner webhook URL, subscribed events, or other details',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async updatePartner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ): Promise<PartnerResponseDto> {
    const partner = await this.partnerService.updatePartner(id, dto);
    return this.mapToResponse(partner);
  }

  /**
   * Activate partner
   *
   * POST /api/v1/partners/:id/activate
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate partner',
    description: 'Re-activate a suspended or inactive partner',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  async activatePartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    const partner = await this.partnerService.activatePartner(id);
    return this.mapToResponse(partner);
  }

  /**
   * Deactivate partner
   *
   * POST /api/v1/partners/:id/deactivate
   */
  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate partner',
    description: 'Temporarily stop sending webhooks to this partner',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  async deactivatePartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    const partner = await this.partnerService.deactivatePartner(id);
    return this.mapToResponse(partner);
  }

  /**
   * Delete partner
   *
   * DELETE /api/v1/partners/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete partner',
    description: 'Permanently remove a partner and stop all webhooks',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 204, description: 'Partner deleted' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async deletePartner(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const deleted = await this.partnerService.deletePartner(id);

    if (!deleted) {
      throw new NotFoundException(`Partner not found: ${id}`);
    }
  }

  /**
   * Regenerate secret
   *
   * POST /api/v1/partners/:id/regenerate-secret
   */
  @Post(':id/regenerate-secret')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerate webhook secret',
    description: `
      Generate a new HMAC secret for the partner.

      **WARNING**: The old secret will immediately stop working.
      Make sure to update your webhook verification code with the new secret.
    `,
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({
    status: 200,
    description: 'New secret generated',
    schema: {
      type: 'object',
      properties: {
        secret: { type: 'string', description: 'New HMAC secret' },
        message: { type: 'string' },
      },
    },
  })
  async regenerateSecret(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ secret: string; message: string }> {
    const newSecret = await this.partnerService.regenerateSecret(id);

    return {
      secret: newSecret,
      message: 'Secret regenerated. Update your webhook verification immediately.',
    };
  }

  /**
   * Send test webhook
   *
   * POST /api/v1/partners/:id/test-webhook
   */
  @Post(':id/test-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send test webhook',
    description: 'Send a test webhook to verify partner integration',
  })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({
    status: 200,
    description: 'Test webhook result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        statusCode: { type: 'number' },
        error: { type: 'string' },
      },
    },
  })
  async sendTestWebhook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendTestWebhookDto,
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    return this.webhookDispatcher.sendTestWebhook(id, dto.eventType);
  }

  // Helper method
  private mapToResponse(partner: Partner): PartnerResponseDto {
    return {
      id: partner.id,
      name: partner.name,
      webhookUrl: partner.webhookUrl,
      subscribedEvents: partner.subscribedEvents,
      status: partner.status,
      description: partner.description,
      contactEmail: partner.contactEmail,
      createdAt: partner.createdAt.toISOString(),
      updatedAt: partner.updatedAt.toISOString(),
      lastWebhookAt: partner.lastWebhookAt?.toISOString(),
      failedWebhookCount: partner.failedWebhookCount,
    };
  }
}
