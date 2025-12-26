/**
 * Mock Payment Gateway Adapter
 *
 * Local testing implementation of IPaymentGatewayPort.
 * Simulates successful payments without calling external APIs.
 * Automatically used when NODE_ENV=development.
 *
 * Features:
 * - Generates fake payment intent IDs
 * - Simulates webhook validation
 * - Allows testing payment flows without Stripe account
 */

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import {
  IPaymentGatewayPort,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  RefundParams,
  RefundResult,
  WebhookValidationResult,
} from '../../../domain/ports/payment-gateway.port';

@Injectable()
export class MockPaymentAdapter extends IPaymentGatewayPort {
  private readonly logger = new Logger(MockPaymentAdapter.name);

  /** In-memory store for mock payment intents */
  private readonly mockPayments = new Map<string, PaymentIntentResult>();

  constructor() {
    super();
    this.logger.warn(
      '🧪 Using MockPaymentAdapter - NO REAL PAYMENTS WILL BE PROCESSED',
    );
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentResult> {
    const id = `pi_mock_${randomUUID().replaceAll('-', '')}`;
    const clientSecret = `${id}_secret_mock_${randomUUID().slice(0, 8)}`;

    this.logger.log(
      `[MOCK] Creating payment intent: ${params.amount} ${params.currency}`,
    );

    const result: PaymentIntentResult = {
      id,
      clientSecret,
      status: 'requires_payment_method',
      amount: params.amount,
      currency: params.currency.toLowerCase(),
    };

    // Store for later retrieval
    this.mockPayments.set(id, result);

    // Simulate async processing
    await this.simulateDelay();

    this.logger.log(`[MOCK] Payment intent created: ${id}`);

    return result;
  }

  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntentResult> {
    this.logger.log(`[MOCK] Retrieving payment intent: ${paymentIntentId}`);

    await this.simulateDelay();

    const existing = this.mockPayments.get(paymentIntentId);
    if (existing) {
      return existing;
    }

    // Return a default mock for unknown IDs
    return {
      id: paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_mock`,
      status: 'succeeded', // Assume success for unknown intents
      amount: 0,
      currency: 'usd',
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    this.logger.log(`[MOCK] Processing refund for: ${params.paymentIntentId}`);

    await this.simulateDelay();

    const refundId = `re_mock_${randomUUID().replaceAll('-', '')}`;

    // Get original payment to determine refund amount
    const original = this.mockPayments.get(params.paymentIntentId);
    const refundAmount = params.amount ?? original?.amount ?? 0;

    this.logger.log(`[MOCK] Refund processed: ${refundId} for ${refundAmount}`);

    return {
      id: refundId,
      amount: refundAmount,
      status: 'succeeded',
    };
  }

  validateWebhook(
    payload: string | Buffer,
    signature: string,
  ): WebhookValidationResult {
    this.logger.log('[MOCK] Validating webhook signature');

    // In mock mode, accept any webhook with 'mock' in signature
    // or validate using a simple check
    const signatureStr = signature.toString();

    if (signatureStr.includes('invalid')) {
      return {
        isValid: false,
        error: 'Mock: Invalid signature detected',
      };
    }

    // Try to parse the payload
    try {
      const parsedPayload =
        typeof payload === 'string'
          ? JSON.parse(payload)
          : JSON.parse(payload.toString());

      return {
        isValid: true,
        event: {
          type: parsedPayload.type ?? 'payment_intent.succeeded',
          data: parsedPayload.data ?? { id: 'mock_event' },
        },
      };
    } catch {
      // If payload is not JSON, create a mock event
      return {
        isValid: true,
        event: {
          type: 'payment_intent.succeeded',
          data: { id: 'mock_event_fallback' },
        },
      };
    }
  }

  getPublicKey(): string {
    return 'pk_test_mock_public_key_for_development';
  }

  /**
   * Test helper: Simulate payment completion
   * Call this to change a payment intent status to 'succeeded'
   */
  simulatePaymentSuccess(paymentIntentId: string): void {
    const payment = this.mockPayments.get(paymentIntentId);
    if (payment) {
      payment.status = 'succeeded';
      this.mockPayments.set(paymentIntentId, payment);
      this.logger.log(`[MOCK] Payment ${paymentIntentId} marked as succeeded`);
    }
  }

  /**
   * Test helper: Get all mock payments
   */
  getAllMockPayments(): PaymentIntentResult[] {
    return Array.from(this.mockPayments.values());
  }

  /**
   * Test helper: Clear all mock payments
   */
  clearMockPayments(): void {
    this.mockPayments.clear();
    this.logger.log('[MOCK] All mock payments cleared');
  }

  private async simulateDelay(): Promise<void> {
    // Simulate network latency (50-150ms)
    const delay = Math.random() * 100 + 50;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
