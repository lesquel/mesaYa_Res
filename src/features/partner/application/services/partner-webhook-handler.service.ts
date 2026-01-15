/**
 * Partner Webhook Handler Service
 *
 * Handles incoming webhooks from partners.
 * Verifies HMAC signatures and processes partner events.
 */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  Partner,
  WebhookLog,
  IPartnerRepositoryPort,
  IWebhookLogRepositoryPort,
} from '../../domain';
import { HmacService } from './hmac.service';

export interface IncomingWebhookData {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookProcessingResult {
  success: boolean;
  message: string;
  eventType?: string;
}

@Injectable()
export class PartnerWebhookHandlerService {
  private readonly logger = new Logger(PartnerWebhookHandlerService.name);

  constructor(
    private readonly partnerRepository: IPartnerRepositoryPort,
    private readonly webhookLogRepository: IWebhookLogRepositoryPort,
    private readonly hmacService: HmacService,
  ) {}

  /**
   * Process an incoming webhook from a partner
   *
   * @param partnerId - The partner ID from the URL
   * @param signature - The X-Webhook-Signature header
   * @param timestamp - The X-Webhook-Timestamp header
   * @param rawPayload - The raw request body as string
   * @param parsedPayload - The parsed JSON payload
   */
  async processIncomingWebhook(
    partnerId: string,
    signature: string,
    timestamp: string,
    rawPayload: string,
    parsedPayload: IncomingWebhookData,
  ): Promise<WebhookProcessingResult> {
    this.logger.log(`Processing incoming webhook from partner: ${partnerId}`);

    // Find partner
    const partner = await this.partnerRepository.findById(partnerId);

    if (!partner) {
      this.logger.warn(`Partner not found: ${partnerId}`);
      throw new UnauthorizedException('Invalid partner');
    }

    if (!partner.canReceiveWebhooks()) {
      this.logger.warn(`Partner ${partnerId} is not active`);
      throw new UnauthorizedException('Partner is not active');
    }

    // Verify HMAC signature
    const verificationResult = this.hmacService.verifySignature(
      rawPayload,
      signature,
      timestamp,
      partner.secret,
    );

    // Log the incoming webhook
    const log = new WebhookLog({
      partnerId: partner.id,
      direction: 'incoming',
      eventType: parsedPayload.event,
      payload: parsedPayload as unknown as Record<string, unknown>,
    });

    if (!verificationResult.isValid) {
      this.logger.error(
        `Webhook signature verification failed for ${partnerId}: ${verificationResult.error}`,
      );

      log.markAsFailed(verificationResult.error ?? 'Invalid signature');
      await this.webhookLogRepository.save(log);

      throw new UnauthorizedException(
        verificationResult.error ?? 'Invalid signature',
      );
    }

    // Process the event based on type
    try {
      const result = this.handlePartnerEvent(partner, parsedPayload);

      log.markAsSuccess(200, JSON.stringify(result));
      await this.webhookLogRepository.save(log);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      log.markAsFailed(errorMessage);
      await this.webhookLogRepository.save(log);

      throw error;
    }
  }

  /**
   * Handle specific partner events
   *
   * This is where you implement the business logic for incoming partner events.
   * For example: updating guest itinerary when a tour is booked.
   */
  private handlePartnerEvent(
    partner: Partner,
    payload: IncomingWebhookData,
  ): WebhookProcessingResult {
    const eventType = payload.event;
    const data = payload.data;

    this.logger.log(
      `Processing event '${eventType}' from partner '${partner.name}'`,
    );

    switch (eventType) {
      // =================================================================
      // Hotel/Restaurant ← Tour Company Integration
      // =================================================================
      case 'tour.booked':
        // A partner tour company notifies that a guest booked a tour
        return this.handleTourBooked(partner, data);

      case 'tour.cancelled':
        // A partner tour company notifies that a tour was cancelled
        return this.handleTourCancelled(partner, data);

      case 'tour.completed':
        // A partner tour company notifies that a tour was completed
        return this.handleTourCompleted(partner);

      // =================================================================
      // Restaurant ← Hotel Integration
      // =================================================================
      case 'guest.checkin':
        // A partner hotel notifies that a guest checked in
        return this.handleGuestCheckin(partner, data);

      case 'guest.checkout':
        // A partner hotel notifies that a guest checked out
        return this.handleGuestCheckout(partner);

      // =================================================================
      // Generic Partner Events
      // =================================================================
      case 'partner.test':
        // Test webhook from partner
        return {
          success: true,
          message: 'Test webhook received successfully',
          eventType,
        };

      default:
        this.logger.warn(
          `Unknown event type from ${partner.name}: ${eventType}`,
        );
        return {
          success: true,
          message: `Event '${eventType}' acknowledged but not processed`,
          eventType,
        };
    }
  }

  // =====================================================================
  // Event Handlers
  // =====================================================================

  private handleTourBooked(
    partner: Partner,
    data: Record<string, unknown>,
  ): WebhookProcessingResult {
    this.logger.log(`Tour booked notification from ${partner.name}`);

    // Extract relevant data
    const guestEmail = data.guestEmail as string | undefined;
    const tourName = data.tourName as string | undefined;
    const tourDate = data.tourDate as string | undefined;

    // TODO: Implement actual business logic
    // - Find reservation by guest email
    // - Update guest's itinerary/notes
    // - Send notification to restaurant staff

    this.logger.log(
      `Would update itinerary for ${guestEmail ?? 'unknown'}: Tour "${tourName}" on ${tourDate}`,
    );

    return {
      success: true,
      message: `Tour booking recorded for guest`,
      eventType: 'tour.booked',
    };
  }

  private handleTourCancelled(
    partner: Partner,
    data: Record<string, unknown>,
  ): WebhookProcessingResult {
    this.logger.log(`Tour cancelled notification from ${partner.name}`);

    const bookingId = data.bookingId as string | undefined;

    // TODO: Update guest itinerary to remove the tour

    return {
      success: true,
      message: `Tour cancellation recorded: ${bookingId}`,
      eventType: 'tour.cancelled',
    };
  }

  private handleTourCompleted(partner: Partner): WebhookProcessingResult {
    this.logger.log(`Tour completed notification from ${partner.name}`);

    // TODO: Mark tour as completed in guest's activity log

    return {
      success: true,
      message: 'Tour completion recorded',
      eventType: 'tour.completed',
    };
  }

  private handleGuestCheckin(
    partner: Partner,
    data: Record<string, unknown>,
  ): WebhookProcessingResult {
    this.logger.log(`Guest checkin notification from ${partner.name}`);

    const hotelName = data.hotelName as string | undefined;

    // TODO: Could trigger personalized restaurant recommendations
    // based on the hotel they're staying at

    return {
      success: true,
      message: `Guest checkin recorded from ${hotelName}`,
      eventType: 'guest.checkin',
    };
  }

  private handleGuestCheckout(partner: Partner): WebhookProcessingResult {
    this.logger.log(`Guest checkout notification from ${partner.name}`);

    // TODO: Clean up any pending reservations, send feedback requests

    return {
      success: true,
      message: 'Guest checkout recorded',
      eventType: 'guest.checkout',
    };
  }
}
