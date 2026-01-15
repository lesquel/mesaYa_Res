/**
 * HMAC Webhook Service
 *
 * Provides HMAC-SHA256 signature generation and verification
 * for secure webhook communication between partners.
 *
 * Security:
 * - Uses HMAC-SHA256 for signature generation
 * - Includes timestamp to prevent replay attacks
 * - Validates signature within 5-minute window
 */

import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface WebhookSignature {
  signature: string;
  timestamp: number;
}

export interface SignedPayload {
  payload: string;
  signature: string;
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
}

@Injectable()
export class HmacWebhookService {
  private readonly logger = new Logger(HmacWebhookService.name);

  /** Signature validity window in seconds (5 minutes) */
  private readonly SIGNATURE_VALIDITY_SECONDS = 5 * 60;

  /**
   * Generate HMAC-SHA256 signature for a webhook payload
   *
   * @param payload - The JSON payload to sign
   * @param secret - Partner's webhook secret
   * @returns Signature and timestamp
   */
  generateSignature(payload: string, secret: string): WebhookSignature {
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `${timestamp}.${payload}`;

    const signature = createHmac('sha256', secret)
      .update(signaturePayload)
      .digest('hex');

    return {
      signature: `t=${timestamp},v1=${signature}`,
      timestamp,
    };
  }

  /**
   * Verify HMAC-SHA256 signature from incoming webhook
   *
   * @param signature - Signature header value
   * @param payload - Raw request body
   * @param secret - Partner's webhook secret
   * @returns VerificationResult with valid flag and optional error
   */
  verifySignature(
    signature: string,
    payload: string,
    secret: string,
  ): VerificationResult {
    try {
      // Parse signature header: "t=timestamp,v1=signature"
      const parts = signature.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const signaturePart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !signaturePart) {
        this.logger.warn('Invalid signature format');
        return { valid: false, error: 'Invalid signature format' };
      }

      const timestamp = parseInt(timestampPart.slice(2), 10);
      const receivedSignature = signaturePart.slice(3);

      // Check timestamp is within validity window
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > this.SIGNATURE_VALIDITY_SECONDS) {
        this.logger.warn(
          `Signature timestamp outside validity window: ${Math.abs(now - timestamp)}s`,
        );
        return { valid: false, error: 'Signature timestamp expired' };
      }

      // Compute expected signature
      const signaturePayload = `${timestamp}.${payload}`;
      const expectedSignature = createHmac('sha256', secret)
        .update(signaturePayload)
        .digest('hex');

      // Timing-safe comparison to prevent timing attacks
      const isValid = timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature),
      );

      if (!isValid) {
        this.logger.warn('Signature mismatch');
        return { valid: false, error: 'Signature mismatch' };
      }

      return { valid: true };
    } catch (error) {
      this.logger.error('Signature verification error', error);
      return { valid: false, error: 'Signature verification failed' };
    }
  }

  /**
   * Build headers for outgoing webhook request
   */
  buildWebhookHeaders(signature: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-MesaYa-Signature': signature,
      'X-MesaYa-Webhook-Version': 'v1',
      'User-Agent': 'MesaYa-Webhook/1.0',
    };
  }
}
