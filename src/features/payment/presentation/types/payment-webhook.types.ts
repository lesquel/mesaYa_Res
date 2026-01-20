/**
 * Payment Webhook Types
 *
 * Types for webhook payloads and events from payment gateways.
 */

/**
 * Stripe webhook event types we handle.
 */
export type StripeEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.refunded'
  | 'charge.dispute.created';

/**
 * Payload structure for payment webhook events published to Kafka.
 */
export interface PaymentWebhookPayload {
  /** The type of Stripe event */
  event_type: StripeEventType;
  /** Stripe Payment Intent ID */
  payment_intent_id: string;
  /** ISO timestamp when the event was received */
  timestamp: string;
  /** Raw event data from Stripe */
  data: Record<string, unknown>;
  /** Metadata about the webhook */
  metadata: {
    /** Source payment gateway */
    source: 'stripe' | 'paypal' | 'mercadopago';
    /** Unique webhook identifier */
    webhook_id: string;
  };
}

/**
 * Request body for creating a payment intent.
 */
export interface CreatePaymentIntentRequestBody {
  /** Amount in currency units (e.g., dollars, not cents) */
  amount: number;
  /** ISO 4217 currency code (default: 'usd') */
  currency?: string;
  /** Additional metadata to attach to the payment */
  metadata?: Record<string, string>;
  /** Description of the payment */
  description?: string;
  /** Customer email for receipts */
  customerEmail?: string;
}

/**
 * Response from creating a payment intent.
 */
export interface CreatePaymentIntentResponse {
  /** Client secret for Stripe.js */
  clientSecret: string;
  /** Payment Intent ID */
  paymentIntentId: string;
  /** Stripe publishable key */
  publicKey: string;
}
