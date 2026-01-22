/**
 * Payment Microservice Client
 *
 * HTTP client that communicates with the Payment Microservice.
 * Acts as part of the API Gateway pattern, allowing the main backend
 * to proxy requests to the Payment MS while adding authentication,
 * validation, and business logic.
 */

import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type {
  CreatePaymentMsRequest,
  CreatePaymentMsResponse,
  GetPaymentMsResponse,
  VerifyPaymentMsResponse,
} from './payment-ms.types';

@Injectable()
export class PaymentMsClientService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(
    @Inject(LOGGER) private readonly logger: ILoggerPort,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'PAYMENT_MS_URL',
      'http://localhost:8003',
    );
    this.timeout = this.configService.get<number>('PAYMENT_MS_TIMEOUT', 30000);

    this.logger.log(
      `PaymentMsClientService initialized with baseUrl: ${this.baseUrl}`,
      'PaymentMsClient',
    );
  }

  /**
   * Create a new payment in the Payment Microservice.
   */
  async createPayment(
    request: CreatePaymentMsRequest,
  ): Promise<CreatePaymentMsResponse> {
    const url = `${this.baseUrl}/api/payments`;

    this.logger.log(
      `Creating payment: ${request.amount} ${request.currency}`,
      'PaymentMsClient.createPayment',
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        this.logger.error(
          `Payment MS returned error: ${response.status}`,
          JSON.stringify(errorBody),
          'PaymentMsClient.createPayment',
        );
        throw new HttpException(
          errorBody.detail || errorBody.message || 'Payment creation failed',
          response.status,
        );
      }

      // Payment MS wraps responses in APIResponse { success, message, data }
      const responseBody = await response.json();
      const data = (responseBody.data ||
        responseBody) as CreatePaymentMsResponse;

      this.logger.log(
        `Payment created successfully: ${data.payment_id}, checkout_url: ${data.checkout_url || 'NOT_PROVIDED'}`,
        'PaymentMsClient.createPayment',
      );

      // Ensure checkout_url is present
      if (!data.checkout_url) {
        this.logger.warn(
          `Payment MS did not return checkout_url for payment ${data.payment_id}`,
          'PaymentMsClient.createPayment',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error(
          'Payment MS request timed out',
          '',
          'PaymentMsClient.createPayment',
        );
        throw new HttpException(
          'Payment service is not responding',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      this.logger.error(
        'Failed to connect to Payment MS',
        error instanceof Error ? error.message : 'Unknown error',
        'PaymentMsClient.createPayment',
      );
      throw new HttpException(
        'Payment service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get payment details from the Payment Microservice.
   */
  async getPayment(paymentId: string): Promise<GetPaymentMsResponse> {
    const url = `${this.baseUrl}/api/payments/${paymentId}`;

    this.logger.log(
      `Getting payment: ${paymentId}`,
      'PaymentMsClient.getPayment',
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new HttpException(
          errorBody.detail || errorBody.message || 'Failed to get payment',
          response.status,
        );
      }

      // Payment MS wraps responses in APIResponse { success, message, data }
      const responseBody = await response.json();
      return (responseBody.data || responseBody) as GetPaymentMsResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to get payment: ${paymentId}`,
        error instanceof Error ? error.message : 'Unknown error',
        'PaymentMsClient.getPayment',
      );
      throw new HttpException(
        'Payment service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Verify a payment in the Payment Microservice.
   */
  async verifyPayment(paymentId: string): Promise<VerifyPaymentMsResponse> {
    const url = `${this.baseUrl}/api/payments/${paymentId}/verify`;

    this.logger.log(
      `Verifying payment: ${paymentId}`,
      'PaymentMsClient.verifyPayment',
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new HttpException(
          errorBody.detail || errorBody.message || 'Failed to verify payment',
          response.status,
        );
      }

      // Payment MS wraps responses in APIResponse { success, message, data }
      const responseBody = await response.json();
      return (responseBody.data || responseBody) as VerifyPaymentMsResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to verify payment: ${paymentId}`,
        error instanceof Error ? error.message : 'Unknown error',
        'PaymentMsClient.verifyPayment',
      );
      throw new HttpException(
        'Payment service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Cancel a payment in the Payment Microservice.
   */
  async cancelPayment(
    paymentId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string }> {
    const url = `${this.baseUrl}/api/payments/${paymentId}/cancel`;

    this.logger.log(
      `Cancelling payment: ${paymentId}, reason: ${reason || 'N/A'}`,
      'PaymentMsClient.cancelPayment',
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new HttpException(
          errorBody.detail || errorBody.message || 'Failed to cancel payment',
          response.status,
        );
      }

      // Payment MS wraps responses in APIResponse { success, message, data }
      const responseBody = await response.json();
      const data = responseBody.data || responseBody;
      return {
        success: data.canceled ?? true,
        message: 'Payment cancelled successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Failed to cancel payment: ${paymentId}`,
        error instanceof Error ? error.message : 'Unknown error',
        'PaymentMsClient.cancelPayment',
      );
      throw new HttpException(
        'Payment service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Health check for the Payment Microservice.
   */
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const url = `${this.baseUrl}/health`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      return {
        healthy: response.ok,
        latencyMs,
      };
    } catch {
      return {
        healthy: false,
        latencyMs: Date.now() - startTime,
      };
    }
  }
}
