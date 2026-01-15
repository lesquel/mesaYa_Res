/**
 * HMAC Service
 *
 * Provides cryptographic functions for webhook security:
 * - Generate shared secrets for partners
 * - Sign outgoing webhooks with HMAC-SHA256
 * - Verify incoming webhooks from partners
 *
 * Follows the standard webhook security pattern used by Stripe, GitHub, etc.
 */

import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface SignedWebhook {
  payload: WebhookPayload;
  signature: string;
  timestamp: string;
}

@Injectable()
export class HmacService {
  private readonly logger = new Logger(HmacService.name);

  /**
   * Generate a cryptographically secure secret for a partner
   * Returns a 64-character hex string (32 bytes)
   */
  generateSecret(): string {
    const secret = randomBytes(32).toString('hex');
    this.logger.debug('Generated new HMAC secret');
    return secret;
  }

  /**
   * Sign a webhook payload using HMAC-SHA256
   *
   * The signature format follows industry standards:
   * signature = HMAC-SHA256(timestamp.payload, secret)
   *
   * @param payload - The webhook payload to sign
   * @param secret - The partner's shared secret
   * @returns The hex-encoded signature
   */
  signPayload(payload: WebhookPayload, secret: string): string {
    const timestamp = payload.timestamp;
    const payloadString = JSON.stringify(payload);

    // Create signature: HMAC-SHA256(timestamp.payload)
    const signatureBase = `${timestamp}.${payloadString}`;
    const signature = createHmac('sha256', secret)
      .update(signatureBase)
      .digest('hex');

    this.logger.debug(`Signed payload for event: ${payload.event}`);
    return signature;
  }

  /**
   * Create a signed webhook ready to send
   *
   * @param event - Event type (e.g., 'reservation.confirmed')
   * @param data - Event data payload
   * @param secret - Partner's shared secret
   * @returns Signed webhook with payload, signature, and timestamp
   */
  createSignedWebhook(
    event: string,
    data: Record<string, unknown>,
    secret: string,
  ): SignedWebhook {
    const timestamp = new Date().toISOString();

    const payload: WebhookPayload = {
      event,
      timestamp,
      data,
    };

    const signature = this.signPayload(payload, secret);

    return {
      payload,
      signature,
      timestamp,
    };
  }

  /**
   * Verify an incoming webhook signature
   *
   * Uses timing-safe comparison to prevent timing attacks.
   *
   * @param payload - The received payload (as string or object)
   * @param signature - The signature from X-Webhook-Signature header
   * @param timestamp - The timestamp from X-Webhook-Timestamp header
   * @param secret - The partner's shared secret
   * @param maxAgeSeconds - Maximum age of webhook (default: 300 = 5 minutes)
   * @returns Whether the signature is valid
   */
  verifySignature(
    payload: string | Record<string, unknown>,
    signature: string,
    timestamp: string,
    secret: string,
    maxAgeSeconds = 300,
  ): { isValid: boolean; error?: string } {
    // Check timestamp to prevent replay attacks
    const webhookTime = new Date(timestamp).getTime();
    const now = Date.now();
    const ageSeconds = (now - webhookTime) / 1000;

    if (ageSeconds > maxAgeSeconds) {
      this.logger.warn(
        `Webhook timestamp too old: ${ageSeconds}s > ${maxAgeSeconds}s`,
      );
      return {
        isValid: false,
        error: `Webhook timestamp expired (${Math.round(ageSeconds)}s old)`,
      };
    }

    if (ageSeconds < -60) {
      // Allow 1 minute clock skew into the future
      this.logger.warn(`Webhook timestamp is in the future: ${ageSeconds}s`);
      return {
        isValid: false,
        error: 'Webhook timestamp is in the future',
      };
    }

    // Compute expected signature
    const payloadString =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signatureBase = `${timestamp}.${payloadString}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signatureBase)
      .digest('hex');

    // Use timing-safe comparison
    try {
      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (signatureBuffer.length !== expectedBuffer.length) {
        this.logger.warn('Signature length mismatch');
        return { isValid: false, error: 'Invalid signature format' };
      }

      const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);

      if (!isValid) {
        this.logger.warn('Signature verification failed');
        return { isValid: false, error: 'Invalid signature' };
      }

      this.logger.debug('Webhook signature verified successfully');
      return { isValid: true };
    } catch (error) {
      this.logger.error('Error verifying signature', error);
      return { isValid: false, error: 'Signature verification error' };
    }
  }

  /**
   * Generate webhook headers for outgoing requests
   *
   * @param signature - The computed signature
   * @param timestamp - The timestamp used in signing
   * @returns Headers object to include in the HTTP request
   */
  generateWebhookHeaders(
    signature: string,
    timestamp: string,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': timestamp,
      'X-Webhook-Algorithm': 'HMAC-SHA256',
      'User-Agent': 'MesaYA-Webhook/1.0',
    };
  }
}
