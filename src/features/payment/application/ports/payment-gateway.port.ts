/**
 * Payment Gateway Port - Abstract interface for payment processing
 *
 * This port defines the contract that any payment gateway adapter must implement.
 * Following the Adapter Pattern, this allows switching between different payment
 * providers (Stripe, PayPal, Mock) without changing business logic.
 *
 * @example
 * - StripeAdapter implements this for production
 * - MockPaymentAdapter implements this for development/testing
 */

export interface CreatePaymentIntentParams {
  /** Amount in the smallest currency unit (e.g., cents for USD) */
  amount: number;
  /** ISO 4217 currency code (e.g., 'usd', 'eur') */
  currency: string;
  /** Additional metadata to attach to the payment */
  metadata?: Record<string, string>;
  /** Description shown on the customer's statement */
  description?: string;
  /** Customer email for receipt */
  customerEmail?: string;
}

export interface PaymentIntentResult {
  /** Unique identifier from the payment provider */
  id: string;
  /** Client secret for frontend to complete the payment */
  clientSecret: string;
  /** Current status of the payment intent */
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'succeeded'
    | 'canceled';
  /** Amount in smallest currency unit */
  amount: number;
  /** Currency code */
  currency: string;
}

export interface RefundParams {
  /** Payment intent ID to refund */
  paymentIntentId: string;
  /** Amount to refund (optional, defaults to full amount) */
  amount?: number;
  /** Reason for refund */
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundResult {
  /** Refund ID */
  id: string;
  /** Amount refunded */
  amount: number;
  /** Refund status */
  status: 'succeeded' | 'pending' | 'failed';
}

export interface WebhookValidationResult {
  /** Whether the webhook signature is valid */
  isValid: boolean;
  /** The parsed event if valid */
  event?: {
    type: string;
    data: Record<string, unknown>;
  };
  /** Error message if invalid */
  error?: string;
}

/**
 * Payment Gateway Port Interface
 *
 * Implementations:
 * - StripeAdapter: Real Stripe API integration
 * - MockPaymentAdapter: Local testing without external calls
 */
export abstract class IPaymentGatewayPort {
  /**
   * Create a payment intent for a customer to complete payment
   * @param params Payment parameters
   * @returns Payment intent with client secret for frontend
   */
  abstract createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<PaymentIntentResult>;

  /**
   * Retrieve an existing payment intent by ID
   * @param paymentIntentId The payment intent ID
   * @returns Payment intent details
   */
  abstract getPaymentIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntentResult>;

  /**
   * Process a refund for a payment
   * @param params Refund parameters
   * @returns Refund result
   */
  abstract refund(params: RefundParams): Promise<RefundResult>;

  /**
   * Validate a webhook signature from the payment provider
   * @param payload Raw request body
   * @param signature Signature header value
   * @returns Validation result with parsed event
   */
  abstract validateWebhook(
    payload: string | Buffer,
    signature: string,
  ): WebhookValidationResult;

  /**
   * Get the public key for frontend initialization
   * @returns Public/publishable key
   */
  abstract getPublicKey(): string;
}
