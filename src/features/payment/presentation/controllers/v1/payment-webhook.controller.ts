/**
 * Stripe Webhook Controller
 *
 * Handles incoming webhooks from Stripe payment gateway.
 * Validates signatures and publishes events to Kafka for async processing.
 *
 * Webhook Flow:
 * 1. Stripe sends webhook to /payments/webhook/stripe
 * 2. This controller validates the signature
 * 3. Publishes event to Kafka topic 'mesa-ya.payments.events'
 * 4. Kafka consumers (n8n, backend) handle business logic
 */

import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { IPaymentGatewayPort } from '@features/payment/application/ports/payment-gateway.port';
import { PAYMENT_GATEWAY } from '@features/payment/payment.tokens';
import { KafkaService } from '@shared/infrastructure/kafka';
import { PAYMENTS_EVENTS_TOPIC } from '../../constants';
import type {
  StripeEventType,
  PaymentWebhookPayload,
  CreatePaymentIntentRequestBody,
  CreatePaymentIntentResponse,
} from '../../types';

@ApiTags('Payments - Webhooks')
@Controller({ path: 'payments/webhook', version: '1' })
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGatewayPort,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Stripe Webhook Endpoint
   *
   * Receives and validates webhooks from Stripe.
   * Raw body is required for signature validation.
   *
   * @param signature - Stripe-Signature header
   * @param req - Raw request with body buffer
   */
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description: 'Receives payment events from Stripe. Do not call manually.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for validation',
    required: true,
  })
  @ApiExcludeEndpoint() // Hide from Swagger UI
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;

    if (!rawBody) {
      this.logger.error(
        'No raw body available - ensure rawBody parser is enabled',
      );
      throw new BadRequestException('Invalid request body');
    }

    if (!signature) {
      this.logger.warn('Missing stripe-signature header');
      throw new BadRequestException('Missing signature header');
    }

    // Validate webhook signature
    const validationResult = this.paymentGateway.validateWebhook(
      rawBody,
      signature,
    );

    if (!validationResult.isValid) {
      this.logger.error(`Webhook validation failed: ${validationResult.error}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = validationResult.event!;
    this.logger.log(`Received Stripe webhook: ${event.type}`);

    // Build Kafka payload
    const eventData = event.data;
    const dataObject = eventData as { object?: { id?: string } };
    const paymentIntentId = dataObject.object?.id ?? 'unknown';

    const kafkaPayload: PaymentWebhookPayload = {
      event_type: event.type as StripeEventType,
      payment_intent_id: paymentIntentId,
      timestamp: new Date().toISOString(),
      data: event.data,
      metadata: {
        source: 'stripe',
        webhook_id: `wh_${Date.now()}`,
      },
    };

    // Publish to Kafka for async processing
    await this.kafkaService.emit(PAYMENTS_EVENTS_TOPIC, {
      key: kafkaPayload.payment_intent_id,
      value: kafkaPayload,
    });

    this.logger.log(`Published payment event to Kafka: ${event.type}`);

    // Always return 200 to Stripe to acknowledge receipt
    return { received: true };
  }

  /**
   * Create Payment Intent Endpoint (for frontend)
   *
   * Creates a new payment intent and returns the client secret
   * for the frontend to complete the payment with Stripe Elements.
   */
  @Post('create-intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create payment intent',
    description:
      'Creates a Stripe PaymentIntent and returns client secret for frontend',
  })
  async createPaymentIntent(
    @Req() req: Request,
  ): Promise<CreatePaymentIntentResponse> {
    const body = req.body as CreatePaymentIntentRequestBody;

    if (!body.amount || typeof body.amount !== 'number') {
      throw new BadRequestException('Amount is required and must be a number');
    }

    // Convert to cents (smallest currency unit)
    const amountInCents = Math.round(body.amount * 100);

    const result = await this.paymentGateway.createPaymentIntent({
      amount: amountInCents,
      currency: body.currency ?? 'usd',
      metadata: body.metadata,
      description: body.description,
      customerEmail: body.customerEmail,
    });

    this.logger.log(`Payment intent created: ${result.id}`);

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.id,
      publicKey: this.paymentGateway.getPublicKey(),
    };
  }

  /**
   * Get Public Key Endpoint
   *
   * Returns the Stripe publishable key for frontend initialization.
   */
  @Post('public-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Stripe public key',
    description: 'Returns the publishable key for Stripe.js initialization',
  })
  getPublicKey(): { publicKey: string } {
    return {
      publicKey: this.paymentGateway.getPublicKey(),
    };
  }
}
