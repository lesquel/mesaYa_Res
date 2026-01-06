/**
 * Payment Gateway Controller
 *
 * API Gateway endpoints that proxy requests to the Payment Microservice.
 * This controller adds authentication, authorization, and business logic
 * before forwarding requests to the Payment MS.
 *
 * Benefits of this pattern:
 * - Frontend only communicates with the main backend
 * - Payment MS is not exposed publicly
 * - Centralized authentication and authorization
 * - Can add business logic (validate reservations, users, etc.)
 * - Logging and monitoring in one place
 */

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { PaymentMsClientService } from '@features/payment/infrastructure';
import { PAYMENT_TARGET_PORT } from '@features/payment/payment.tokens';
import type { IPaymentTargetPort } from '@features/payment/domain';
import {
  CreateReservationPaymentDto,
  PaymentCreatedResponseDto,
  PaymentDetailsResponseDto,
  PaymentVerificationResponseDto,
  CancelPaymentDto,
} from '../dto';
import type { AuthenticatedRequest } from '../types';

@ApiTags('Payment Gateway')
@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(
    @Inject(LOGGER) private readonly logger: ILoggerPort,
    @Inject(PAYMENT_TARGET_PORT)
    private readonly targetPort: IPaymentTargetPort,
    private readonly paymentMsClient: PaymentMsClientService,
  ) {}

  /**
   * Create a payment for a reservation.
   * This endpoint validates the user, checks the reservation,
   * and then creates a payment through the Payment Microservice.
   */
  @Post('reservations/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create checkout session for reservation payment',
    description:
      'Creates a payment checkout session through the Payment Microservice. Returns a checkout URL for the user to complete payment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
    type: PaymentCreatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Payment service unavailable' })
  async createReservationCheckout(
    @Body() dto: CreateReservationPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentCreatedResponseDto> {
    const userId = req.user?.sub;

    this.logger.log(
      `Creating reservation payment checkout for user ${userId}, reservation ${dto.reservationId}`,
      'PaymentGateway.createCheckout',
    );

    // Validate that the reservation exists and belongs to the user
    const reservation = await this.targetPort.getReservationOwnership(
      dto.reservationId,
    );
    if (!reservation) {
      throw new NotFoundException(
        `Reservation ${dto.reservationId} not found`,
      );
    }
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'Reservation does not belong to authenticated user',
      );
    }

    // Build success/cancel URLs
    const baseUrl =
      req.headers.origin || req.headers.referer || 'http://localhost:4200';
    const successUrl = `${baseUrl}/payment/success?payment_id={PAYMENT_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    // Create payment through Payment MS
    const result = await this.paymentMsClient.createPayment({
      amount: dto.amount,
      currency: dto.currency || 'USD',
      description: dto.description || `Reservation ${dto.reservationId}`,
      metadata: {
        reservation_id: dto.reservationId,
        user_id: userId || 'anonymous',
        type: 'reservation',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    this.logger.log(
      `Checkout session created: ${result.payment_id}`,
      'PaymentGateway.createCheckout',
    );

    return {
      paymentId: result.payment_id,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      checkoutUrl: result.checkout_url,
      createdAt: result.created_at,
    };
  }

  /**
   * Get payment details by ID.
   */
  @Get(':paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment details',
    description: 'Retrieves payment details from the Payment Microservice.',
  })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved',
    type: PaymentDetailsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentDetailsResponseDto> {
    this.logger.log(
      `Getting payment details: ${paymentId}`,
      'PaymentGateway.getPayment',
    );

    const result = await this.paymentMsClient.getPayment(paymentId);

    return {
      id: result.id,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      description: result.description,
      metadata: result.metadata,
      createdAt: result.created_at,
    };
  }

  /**
   * Verify a payment after checkout redirect.
   */
  @Post(':paymentId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify payment status',
    description:
      'Verifies the payment status after user returns from checkout. Can be called without authentication for redirect handling.',
  })
  @ApiParam({ name: 'paymentId', description: 'Payment ID to verify' })
  @ApiResponse({
    status: 200,
    description: 'Payment verification result',
    type: PaymentVerificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verifyPayment(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentVerificationResponseDto> {
    this.logger.log(
      `Verifying payment: ${paymentId}`,
      'PaymentGateway.verifyPayment',
    );

    const result = await this.paymentMsClient.verifyPayment(paymentId);

    // Note: Reservation status update should be handled by the Reservation module
    // listening to payment events via Kafka (mesa-ya.payments.events topic).
    // This controller should not directly modify reservation state.

    return {
      paymentId: result.payment_id,
      status: result.status,
      verified: result.verified,
      amount: result.amount,
      currency: result.currency,
    };
  }

  /**
   * Cancel a pending payment.
   */
  @Post(':paymentId/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a pending payment',
    description:
      'Cancels a payment that has not been completed yet. Requires authentication.',
  })
  @ApiParam({ name: 'paymentId', description: 'Payment ID to cancel' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Payment cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async cancelPayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: CancelPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    const userId = req.user?.sub;

    this.logger.log(
      `Cancelling payment: ${paymentId}, user: ${userId}, reason: ${dto.reason || 'N/A'}`,
      'PaymentGateway.cancelPayment',
    );

    // Validate that the payment belongs to the user
    const payment = await this.paymentMsClient.getPayment(paymentId);
    if (payment.metadata?.user_id && payment.metadata.user_id !== userId) {
      throw new ForbiddenException(
        'Payment does not belong to authenticated user',
      );
    }

    return await this.paymentMsClient.cancelPayment(paymentId, dto.reason);
  }

  /**
   * Health check for the Payment Microservice.
   */
  @Get('health/check')
  @ApiOperation({
    summary: 'Check Payment MS health',
    description: 'Returns the health status of the Payment Microservice.',
  })
  @ApiResponse({ status: 200, description: 'Health check result' })
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    return await this.paymentMsClient.healthCheck();
  }
}
