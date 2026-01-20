/**
 * Payment Microservice Types
 *
 * Type definitions for communication with the Payment Microservice.
 */

/** Response from creating a payment (from PaymentIntentResponse in Payment MS) */
export interface CreatePaymentMsResponse {
  payment_id: string;
  status: string;
  provider: string;
  checkout_url: string | null;
  client_secret?: string | null;
  // These may be returned by some endpoints but not all
  amount?: number;
  currency?: string;
  created_at?: string;
}

/** Response from getting a payment */
export interface GetPaymentMsResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

/** Response from verifying a payment */
export interface VerifyPaymentMsResponse {
  payment_id: string;
  status: string;
  verified: boolean;
  amount?: number;
  currency?: string;
}

/** Request to create a payment */
export interface CreatePaymentMsRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  success_url?: string;
  cancel_url?: string;
}

/** Response from cancelling a payment */
export interface CancelPaymentMsResponse {
  success: boolean;
  message: string;
}

/** Response from health check */
export interface HealthCheckMsResponse {
  healthy: boolean;
  latencyMs: number;
}
