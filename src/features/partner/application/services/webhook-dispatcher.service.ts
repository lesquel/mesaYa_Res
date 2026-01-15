/**
 * Webhook Dispatcher Service
 *
 * Responsible for sending webhooks to registered partners.
 * Includes retry logic with exponential backoff.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Partner,
  PartnerEventType,
  WebhookLog,
  IPartnerRepositoryPort,
  IWebhookLogRepositoryPort,
} from '../../domain';
import { HmacService } from './hmac.service';

export interface WebhookEventData {
  eventType: PartnerEventType;
  data: Record<string, unknown>;
  metadata?: Record<string, string>;
}

interface WebhookDeliveryResult {
  partnerId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);
  private readonly maxRetries: number;
  private readonly timeoutMs: number;

  constructor(
    private readonly partnerRepository: IPartnerRepositoryPort,
    private readonly webhookLogRepository: IWebhookLogRepositoryPort,
    private readonly hmacService: HmacService,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('WEBHOOK_MAX_RETRIES', 3);
    this.timeoutMs = this.configService.get<number>('WEBHOOK_TIMEOUT_MS', 10000);
  }

  /**
   * Dispatch a webhook event to all subscribed partners
   *
   * @param eventData - The event to dispatch
   * @returns Results of delivery attempts
   */
  async dispatchEvent(
    eventData: WebhookEventData,
  ): Promise<WebhookDeliveryResult[]> {
    this.logger.log(`Dispatching event: ${eventData.eventType}`);

    // Find all active partners subscribed to this event
    const partners = await this.partnerRepository.findBySubscribedEvent(
      eventData.eventType,
    );

    const activePartners = partners.filter((p) => p.canReceiveWebhooks());

    if (activePartners.length === 0) {
      this.logger.debug(`No active partners for event: ${eventData.eventType}`);
      return [];
    }

    this.logger.log(
      `Sending webhook to ${activePartners.length} partners for ${eventData.eventType}`,
    );

    // Send webhooks in parallel
    const results = await Promise.all(
      activePartners.map((partner) =>
        this.sendWebhookToPartner(partner, eventData),
      ),
    );

    return results;
  }

  /**
   * Send webhook to a specific partner
   */
  private async sendWebhookToPartner(
    partner: Partner,
    eventData: WebhookEventData,
  ): Promise<WebhookDeliveryResult> {
    // Create signed webhook
    const signedWebhook = this.hmacService.createSignedWebhook(
      eventData.eventType,
      {
        ...eventData.data,
        metadata: eventData.metadata,
      },
      partner.secret,
    );

    // Create log entry
    const log = new WebhookLog({
      partnerId: partner.id,
      direction: 'outgoing',
      eventType: eventData.eventType,
      payload: signedWebhook.payload as unknown as Record<string, unknown>,
    });

    try {
      // Prepare headers
      const headers = this.hmacService.generateWebhookHeaders(
        signedWebhook.signature,
        signedWebhook.timestamp,
      );

      // Make HTTP request
      const response = await this.makeHttpRequest(
        partner.webhookUrl,
        signedWebhook.payload,
        headers,
      );

      // Update partner and log on success
      partner.recordWebhookSuccess();
      await this.partnerRepository.save(partner);

      log.markAsSuccess(response.statusCode, response.body);
      await this.webhookLogRepository.save(log);

      this.logger.log(
        `Webhook delivered to ${partner.name}: ${response.statusCode}`,
      );

      return {
        partnerId: partner.id,
        success: true,
        statusCode: response.statusCode,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Update partner and log on failure
      partner.recordWebhookFailure();
      await this.partnerRepository.save(partner);

      log.markAsFailed(errorMessage);
      await this.webhookLogRepository.save(log);

      this.logger.error(
        `Webhook delivery failed to ${partner.name}: ${errorMessage}`,
      );

      // Schedule retry if under max retries
      if (log.retryCount < this.maxRetries) {
        this.scheduleRetry(log, partner, eventData);
      }

      return {
        partnerId: partner.id,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Make HTTP POST request to webhook URL
   */
  private async makeHttpRequest(
    url: string,
    payload: unknown,
    headers: Record<string, string>,
  ): Promise<{ statusCode: number; body: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${body.substring(0, 200)}`,
        );
      }

      return {
        statusCode: response.status,
        body: body.substring(0, 1000), // Limit stored response size
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }

      throw error;
    }
  }

  /**
   * Schedule a retry for failed webhook (simplified - in production use a job queue)
   */
  private scheduleRetry(
    log: WebhookLog,
    partner: Partner,
    eventData: WebhookEventData,
  ): void {
    const retryCount = log.retryCount + 1;
    const delayMs = Math.min(1000 * Math.pow(2, retryCount), 60000); // Exponential backoff, max 1 minute

    this.logger.log(
      `Scheduling retry ${retryCount}/${this.maxRetries} for ${partner.name} in ${delayMs}ms`,
    );

    log.markAsRetrying();
    this.webhookLogRepository.save(log);

    // Simple setTimeout for retry (in production, use Bull/BullMQ job queue)
    setTimeout(async () => {
      try {
        await this.sendWebhookToPartner(partner, eventData);
      } catch (error) {
        this.logger.error(`Retry failed for ${partner.name}`, error);
      }
    }, delayMs);
  }

  /**
   * Manually trigger webhook to a specific partner (for testing)
   */
  async sendTestWebhook(
    partnerId: string,
    eventType: PartnerEventType,
  ): Promise<WebhookDeliveryResult> {
    const partner = await this.partnerRepository.findById(partnerId);

    if (!partner) {
      return {
        partnerId,
        success: false,
        error: 'Partner not found',
      };
    }

    return this.sendWebhookToPartner(partner, {
      eventType,
      data: {
        test: true,
        message: 'This is a test webhook from MesaYA',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
