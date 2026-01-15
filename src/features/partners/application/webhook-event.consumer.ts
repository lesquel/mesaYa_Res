/**
 * Webhook Event Consumer
 *
 * Kafka consumer that listens for business events and dispatches
 * webhooks to registered B2B partners.
 */

import { Injectable, Logger } from '@nestjs/common';
import { KafkaConsumer } from '@shared/infrastructure/kafka';
import { PartnerRepository } from '../infrastructure/persistence/partner.repository';
import { PartnerWebhookDispatcher, WebhookEvent, PartnerInfo } from './services/partner-webhook-dispatcher.service';

@Injectable()
export class WebhookEventConsumer {
  private readonly logger = new Logger(WebhookEventConsumer.name);

  constructor(
    private readonly partnerRepository: PartnerRepository,
    private readonly webhookDispatcher: PartnerWebhookDispatcher,
  ) {}

  /**
   * Handle reservation events
   */
  @KafkaConsumer('mesa-ya.reservations', 'webhook-dispatcher')
  async handleReservationEvent(message: Record<string, unknown>): Promise<void> {
    await this.handleEvent('mesa-ya.reservations', message);
  }

  /**
   * Handle payment events
   */
  @KafkaConsumer('mesa-ya.payments', 'webhook-dispatcher')
  async handlePaymentEvent(message: Record<string, unknown>): Promise<void> {
    await this.handleEvent('mesa-ya.payments', message);
  }

  /**
   * Handle restaurant events
   */
  @KafkaConsumer('mesa-ya.restaurants', 'webhook-dispatcher')
  async handleRestaurantEvent(message: Record<string, unknown>): Promise<void> {
    await this.handleEvent('mesa-ya.restaurants', message);
  }

  private async handleEvent(topic: string, message: unknown): Promise<void> {
    try {
      const event = this.parseEvent(topic, message);
      if (!event) return;

      // Find partners subscribed to this event type
      const partners = await this.partnerRepository.findByEventSubscription(event.type);
      if (partners.length === 0) {
        this.logger.debug(`No partners subscribed to ${event.type}`);
        return;
      }

      // Convert to PartnerInfo format
      const partnerInfos: PartnerInfo[] = partners.map((p) => ({
        id: p.id,
        name: p.name,
        webhookUrl: p.webhookUrl,
        secret: p.secret,
        events: p.events,
      }));

      // Dispatch webhooks
      const results = await this.webhookDispatcher.dispatchToAllPartners(
        partnerInfos,
        event,
      );

      // Record delivery status
      for (const result of results) {
        await this.partnerRepository.recordWebhookAttempt(
          result.partnerId,
          result.success,
        );
      }
    } catch (error) {
      this.logger.error('Failed to handle webhook event:', error);
    }
  }

  private parseEvent(topic: string, message: unknown): WebhookEvent | null {
    const payload = message as Record<string, unknown>;
    if (!payload || typeof payload !== 'object') return null;

    const eventType = this.mapTopicToEventType(topic, payload);
    if (!eventType) return null;

    return {
      type: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
      metadata: {
        source: 'mesa-ya',
        correlationId: payload.correlationId as string | undefined,
      },
    };
  }

  private mapTopicToEventType(
    topic: string,
    payload: Record<string, unknown>,
  ): string | null {
    // Extract action from payload if present
    const action = payload.action || payload.eventType || payload.type;

    switch (topic) {
      case 'mesa-ya.reservations':
        if (action) return `reservation.${action}`;
        return 'reservation.updated';

      case 'mesa-ya.payments':
        if (action) return `payment.${action}`;
        return 'payment.updated';

      case 'mesa-ya.restaurants':
        if (action) return `restaurant.${action}`;
        return 'restaurant.updated';

      default:
        return null;
    }
  }
}
