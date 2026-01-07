/**
 * Stripe Payment Gateway Adapter
 *
 * Production implementation of IPaymentGatewayPort using Stripe SDK.
 * Handles real payment processing, webhooks validation, and refunds.
 *
 * @requires STRIPE_SECRET_KEY - Stripe secret key from environment
 * @requires STRIPE_PUBLIC_KEY - Stripe publishable key for frontend
 * @requires STRIPE_WEBHOOK_SECRET - Webhook signing secret
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import {
  IPaymentGatewayPort,
  CreatePaymentIntentParams,
  PaymentIntentResult,
  RefundParams,
  RefundResult,
  WebhookValidationResult,
} from '../../../application/ports/payment-gateway.port';

@Injectable()
export class StripeAdapter extends IPaymentGatewayPort {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeAdapter.name);
  private readonly webhookSecret: string;
  private readonly publicKey: string;

  constructor(private readonly configService: ConfigService) {
    super();

    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    this.publicKey = this.configService.get<string>('STRIPE_PUBLIC_KEY') ?? '';

    if (!secretKey) {
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured - Stripe payments will fail',
      );
    }

    this.stripe = new Stripe(secretKey ?? '', {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentResult> {
    this.logger.log(
      `Creating payment intent for ${params.amount} ${params.currency}`,
    );

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: params.amount, // Already in smallest unit (cents)
        currency: params.currency.toLowerCase(),
        metadata: params.metadata ?? {},
        description: params.description,
        receipt_email: params.customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${intent.id}`);

      return {
        id: intent.id,
        clientSecret: intent.client_secret ?? '',
        status: this.mapStripeStatus(intent.status),
        amount: intent.amount,
        currency: intent.currency,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw error;
    }
  }

  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntentResult> {
    this.logger.log(`Retrieving payment intent: ${paymentIntentId}`);

    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: intent.id,
        clientSecret: intent.client_secret ?? '',
        status: this.mapStripeStatus(intent.status),
        amount: intent.amount,
        currency: intent.currency,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve payment intent ${paymentIntentId}`,
        error,
      );
      throw error;
    }
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    this.logger.log(`Processing refund for payment: ${params.paymentIntentId}`);

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amount, // Optional: partial refund
        reason: params.reason,
      });

      this.logger.log(`Refund processed: ${refund.id}`);

      // Map Stripe refund status to our RefundResult status
      const mapRefundStatus = (
        status: string,
      ): 'succeeded' | 'pending' | 'failed' => {
        if (status === 'succeeded') return 'succeeded';
        if (status === 'pending') return 'pending';
        return 'failed';
      };

      return {
        id: refund.id,
        amount: refund.amount,
        status: mapRefundStatus(refund.status ?? 'failed'),
      };
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      throw error;
    }
  }

  validateWebhook(
    payload: string | Buffer,
    signature: string,
  ): WebhookValidationResult {
    if (!this.webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET not configured');
      return {
        isValid: false,
        error: 'Webhook secret not configured',
      };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      this.logger.log(`Webhook validated: ${event.type}`);

      return {
        isValid: true,
        event: {
          type: event.type,
          data: event.data.object as unknown as Record<string, unknown>,
        },
      };
    } catch (error) {
      this.logger.error('Webhook validation failed', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid signature',
      };
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  private mapStripeStatus(
    status: Stripe.PaymentIntent.Status,
  ): PaymentIntentResult['status'] {
    switch (status) {
      case 'requires_payment_method':
        return 'requires_payment_method';
      case 'requires_confirmation':
        return 'requires_confirmation';
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
        return 'canceled';
      default:
        return 'requires_payment_method';
    }
  }
}
