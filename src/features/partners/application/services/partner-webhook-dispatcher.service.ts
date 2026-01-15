/**
 * Partner Webhook Dispatcher Service
 *
 * Handles sending webhooks to registered partners.
 * Features:
 * - HMAC-SHA256 signature for all outgoing webhooks
 * - Retry logic with exponential backoff
 * - Event filtering per partner subscription
 * - Kafka integration for event sourcing
 */

import { Injectable, Logger } from '@nestjs/common';
import { HmacWebhookService } from './hmac-webhook.service';
import { KafkaService } from '@shared/infrastructure/kafka';

export interface WebhookEvent {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: {
    source: string;
    correlationId?: string;
  };
}

export interface PartnerInfo {
  id: string;
  name: string;
  webhookUrl: string;
  secret: string;
  events: string[];
}

export interface WebhookDeliveryResult {
  partnerId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  retryCount: number;
}

@Injectable()
export class PartnerWebhookDispatcher {
  private readonly logger = new Logger(PartnerWebhookDispatcher.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 5000, 15000]; // Exponential backoff

  constructor(
    private readonly hmacService: HmacWebhookService,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Dispatch webhook to a single partner
   */
  async dispatchToPartner(
    partner: PartnerInfo,
    event: WebhookEvent,
  ): Promise<WebhookDeliveryResult> {
    // Check if partner subscribes to this event
    if (!this.isSubscribed(partner, event.type)) {
      this.logger.debug(
        `Partner ${partner.name} not subscribed to ${event.type}`,
      );
      return {
        partnerId: partner.id,
        success: true,
        retryCount: 0,
      };
    }

    const payload = JSON.stringify(event);
    let lastError: string | undefined;
    let lastStatusCode: number | undefined;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Generate HMAC signature
        const { signature } = this.hmacService.generateSignature(
          payload,
          partner.secret,
        );

        // Build headers
        const headers = this.hmacService.buildWebhookHeaders(signature);

        // Send webhook
        const response = await fetch(partner.webhookUrl, {
          method: 'POST',
          headers,
          body: payload,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        lastStatusCode = response.status;

        if (response.ok) {
          this.logger.log(
            `Webhook delivered to ${partner.name}: ${event.type}`,
          );

          // Emit success event to Kafka
          await this.emitDeliveryEvent(partner, event, 'delivered', attempt);

          return {
            partnerId: partner.id,
            success: true,
            statusCode: response.status,
            retryCount: attempt,
          };
        }

        lastError = `HTTP ${response.status}: ${response.statusText}`;
        this.logger.warn(
          `Webhook delivery failed to ${partner.name}: ${lastError} (attempt ${attempt + 1})`,
        );
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Webhook delivery error to ${partner.name}: ${lastError} (attempt ${attempt + 1})`,
        );
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.MAX_RETRIES) {
        await this.delay(this.RETRY_DELAYS[attempt]);
      }
    }

    // All retries failed
    await this.emitDeliveryEvent(partner, event, 'failed', this.MAX_RETRIES);

    return {
      partnerId: partner.id,
      success: false,
      statusCode: lastStatusCode,
      error: lastError,
      retryCount: this.MAX_RETRIES,
    };
  }

  /**
   * Dispatch webhook to multiple partners
   */
  async dispatchToAllPartners(
    partners: PartnerInfo[],
    event: WebhookEvent,
  ): Promise<WebhookDeliveryResult[]> {
    const results = await Promise.all(
      partners.map((partner) => this.dispatchToPartner(partner, event)),
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger.log(
      `Webhook dispatch complete: ${successful} delivered, ${failed} failed`,
    );

    return results;
  }

  /**
   * Check if partner subscribes to event type
   */
  private isSubscribed(partner: PartnerInfo, eventType: string): boolean {
    return partner.events.includes('*') || partner.events.includes(eventType);
  }

  /**
   * Emit delivery status to Kafka for monitoring
   */
  private async emitDeliveryEvent(
    partner: PartnerInfo,
    event: WebhookEvent,
    status: 'delivered' | 'failed',
    retryCount: number,
  ): Promise<void> {
    try {
      await this.kafkaService.emit('mesa-ya.webhooks.delivery', {
        key: partner.id,
        value: {
          partnerId: partner.id,
          partnerName: partner.name,
          eventType: event.type,
          status,
          retryCount,
          timestamp: new Date().toISOString(),
        },
      });
    } catch {
      // Don't fail the main operation if Kafka emit fails
      this.logger.warn('Failed to emit webhook delivery event to Kafka');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
