/**
 * Webhook Log Repository Port
 *
 * Defines the contract for webhook log persistence.
 */

import type { WebhookLog } from '../entities/webhook-log.entity';

export abstract class IWebhookLogRepositoryPort {
  /**
   * Save a webhook log entry
   */
  abstract save(log: WebhookLog): Promise<WebhookLog>;

  /**
   * Find log by ID
   */
  abstract findById(id: string): Promise<WebhookLog | null>;

  /**
   * Find logs by partner ID with pagination
   */
  abstract findByPartnerId(
    partnerId: string,
    limit?: number,
    offset?: number,
  ): Promise<WebhookLog[]>;

  /**
   * Find recent failed logs for retry
   */
  abstract findPendingRetries(maxRetries: number): Promise<WebhookLog[]>;

  /**
   * Count logs by partner and status
   */
  abstract countByPartnerAndStatus(
    partnerId: string,
    status: string,
  ): Promise<number>;
}
