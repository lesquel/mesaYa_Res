/**
 * Partner Webhook Controller
 *
 * Handles incoming webhooks FROM B2B partners (bidirectional).
 * Verifies HMAC signatures and processes partner events.
 *
 * Base URL: /api/v1/webhooks/partner
 */

import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
  BadRequestException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PartnerWebhookHandlerService, IncomingWebhookData } from '../../application/services';

interface PartnerWebhookPayload {
  event: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

interface WebhookResponseDto {
  received: boolean;
  message: string;
}

@ApiTags('Partner Webhooks - Incoming')
@Controller({ path: 'webhooks/partner', version: '1' })
export class PartnerWebhookController {
  private readonly logger = new Logger(PartnerWebhookController.name);

  constructor(
    private readonly webhookHandler: PartnerWebhookHandlerService,
  ) {}

  /**
   * Receive webhook from partner
   *
   * POST /api/v1/webhooks/partner/:partnerId
   *
   * Partners must sign their webhooks with HMAC-SHA256 using
   * the secret they received during registration.
   */
  @Post(':partnerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive webhook from partner',
    description: `
      Endpoint for B2B partners to send events to MesaYA.

      ## Required Headers

      - \`X-Webhook-Signature\`: HMAC-SHA256 signature of the request body
      - \`X-Webhook-Timestamp\`: ISO 8601 timestamp (required, max 5 min old)

      ## Supported Event Types

      - \`tour.booked\` - Guest booked a tour through the partner
      - \`tour.cancelled\` - Tour booking was cancelled
      - \`tour.completed\` - Tour was completed
      - \`guest.checkin\` - Guest checked in at partner location
      - \`guest.checkout\` - Guest checked out from partner location
      - \`partner.test\` - Test webhook for integration verification

      ## Request Body Format

      \`\`\`json
      {
        "event": "tour.booked",
        "data": {
          "reservationId": "uuid",
          "tourName": "Whale watching",
          "date": "2024-01-15",
          "guests": 2
        },
        "timestamp": "2024-01-10T12:00:00Z"
      }
      \`\`\`

      ## Signature Calculation

      \`signature = HMAC-SHA256(secret, timestamp + "." + body)\`
    `,
  })
  @ApiParam({
    name: 'partnerId',
    description: 'Partner UUID that was assigned during registration',
  })
  @ApiHeader({
    name: 'X-Webhook-Signature',
    description: 'HMAC-SHA256 signature',
    required: true,
  })
  @ApiHeader({
    name: 'X-Webhook-Timestamp',
    description: 'ISO 8601 timestamp',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received successfully',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Invalid signature or timestamp' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async receivePartnerWebhook(
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @Headers('x-webhook-signature') signature: string | undefined,
    @Headers('x-webhook-timestamp') timestamp: string | undefined,
    @Body() body: PartnerWebhookPayload,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<WebhookResponseDto> {
    // Validate required headers
    if (!signature) {
      this.logger.warn(`Missing signature header from partner ${partnerId}`);
      throw new UnauthorizedException('Missing X-Webhook-Signature header');
    }

    if (!timestamp) {
      this.logger.warn(`Missing timestamp header from partner ${partnerId}`);
      throw new UnauthorizedException('Missing X-Webhook-Timestamp header');
    }

    // Get raw body for signature verification
    const rawBody = req.rawBody?.toString('utf-8');
    if (!rawBody) {
      throw new BadRequestException('Unable to read request body');
    }

    // Validate body structure
    if (!body.event || typeof body.event !== 'string') {
      throw new BadRequestException('Missing or invalid "event" field');
    }

    try {
      // Build parsed payload
      const parsedPayload: IncomingWebhookData = {
        event: body.event,
        data: body.data ?? {},
        timestamp: body.timestamp ?? timestamp,
      };

      // Process webhook with signature verification
      const result = await this.webhookHandler.processIncomingWebhook(
        partnerId,
        signature,
        timestamp,
        rawBody,
        parsedPayload,
      );

      return {
        received: result.success,
        message: result.success
          ? 'Webhook processed successfully'
          : result.message,
      };
    } catch (error) {
      this.logger.error(
        `Webhook processing failed for partner ${partnerId}`,
        error instanceof Error ? error.stack : error,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException(
        error instanceof Error ? error.message : 'Webhook processing failed',
      );
    }
  }
}
