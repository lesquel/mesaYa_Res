/**
 * N8n Payment Webhook Controller
 *
 * Handles incoming webhooks from n8n workflow to update payment and reservation status.
 * This controller is called by n8n when processing payment events from the Payment MS.
 *
 * Webhook Flow:
 * 1. Payment MS sends event to Kafka
 * 2. n8n receives event and processes it
 * 3. n8n calls this endpoint to update backend state
 * 4. This controller updates both payment and reservation status
 */

import {
  Controller,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { PaymentStatusEnum } from '@features/payment/domain/enums';
import { PaymentService } from '@features/payment/application';
import { ChangeReservationStatusUseCase } from '@features/reservation/application';
import type { ReservationStatus } from '@features/reservation/domain/types';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import {
  N8nPaymentStatus,
  N8nPaymentStatusUpdateDto,
  N8nPaymentStatusUpdateResponseDto,
} from '../../dto/n8n-payment-status.dto';

/**
 * Maps n8n payment status to internal PaymentStatusEnum
 */
function mapN8nStatusToPaymentStatus(status: N8nPaymentStatus): PaymentStatusEnum {
  switch (status) {
    case N8nPaymentStatus.APPROVED:
    case N8nPaymentStatus.SUCCEEDED:
      return PaymentStatusEnum.COMPLETED;
    case N8nPaymentStatus.PROCESSING:
      return PaymentStatusEnum.PROCESSING;
    case N8nPaymentStatus.PENDING:
      return PaymentStatusEnum.PENDING;
    case N8nPaymentStatus.FAILED:
    case N8nPaymentStatus.REJECTED:
      return PaymentStatusEnum.FAILED;
    case N8nPaymentStatus.REFUNDED:
      return PaymentStatusEnum.REFUNDED;
    default:
      return PaymentStatusEnum.PENDING;
  }
}

/**
 * Maps n8n payment status to reservation status
 */
function mapN8nStatusToReservationStatus(status: N8nPaymentStatus): ReservationStatus {
  switch (status) {
    case N8nPaymentStatus.APPROVED:
    case N8nPaymentStatus.SUCCEEDED:
      return 'CONFIRMED';
    case N8nPaymentStatus.PROCESSING:
    case N8nPaymentStatus.PENDING:
      return 'PENDING';
    case N8nPaymentStatus.FAILED:
    case N8nPaymentStatus.REJECTED:
      return 'REJECTED';
    case N8nPaymentStatus.REFUNDED:
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

@ApiTags('Payments - N8n Webhooks')
@Controller({ path: 'payments/n8n', version: '1' })
export class N8nPaymentWebhookController {
  private readonly logger = new Logger(N8nPaymentWebhookController.name);

  constructor(
    @Inject(LOGGER)
    private readonly loggerPort: ILoggerPort,
    private readonly paymentService: PaymentService,
    private readonly changeReservationStatus: ChangeReservationStatusUseCase,
  ) {}

  /**
   * Update payment and reservation status from n8n workflow
   *
   * This endpoint is called by n8n after processing payment events.
   * It updates both the payment status and the associated reservation status.
   */
  @Patch('payment-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update payment and reservation status from n8n',
    description: 'Called by n8n workflow to sync payment status with backend. Updates both payment and reservation.',
  })
  @ApiBody({ type: N8nPaymentStatusUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Payment and reservation status updated successfully',
    type: N8nPaymentStatusUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment or reservation not found' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async updatePaymentStatus(
    @Body() dto: N8nPaymentStatusUpdateDto,
  ): Promise<N8nPaymentStatusUpdateResponseDto> {
    this.logger.log(
      `Received n8n payment status update: payment=${dto.payment_id}, reservation=${dto.reservation_id}, status=${dto.payment_status}`,
    );

    const paymentStatus = mapN8nStatusToPaymentStatus(dto.payment_status);
    const reservationStatus = mapN8nStatusToReservationStatus(dto.payment_status);

    this.loggerPort.log(
      `Mapping n8n status '${dto.payment_status}' -> payment: ${paymentStatus}, reservation: ${reservationStatus}`,
      'N8nPaymentWebhook',
    );

    // Update payment status
    let paymentUpdated = false;
    try {
      await this.paymentService.updatePaymentStatus({
        paymentId: dto.payment_id,
        status: paymentStatus,
      });
      paymentUpdated = true;
      this.logger.log(`Payment ${dto.payment_id} status updated to ${paymentStatus}`);
    } catch (error) {
      this.logger.warn(
        `Could not update payment ${dto.payment_id}: ${error instanceof Error ? error.message : 'Unknown error'}. Payment may not exist in local DB (handled by Payment MS).`,
      );
      // Payment might not exist in local DB if fully managed by Payment MS
      // This is acceptable - continue to update reservation
    }

    // Update reservation status
    let reservationUpdated = false;
    try {
      await this.changeReservationStatus.execute({
        reservationId: dto.reservation_id,
        status: reservationStatus,
        reason: `Payment status changed to ${dto.payment_status}`,
        notifyCustomer: true,
        actor: 'admin', // System actions use admin privileges
        enforceOwnership: false,
      });
      reservationUpdated = true;
      this.logger.log(`Reservation ${dto.reservation_id} status updated to ${reservationStatus}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update reservation ${dto.reservation_id}: ${errorMessage}`);

      if (!paymentUpdated) {
        throw new NotFoundException(
          `Neither payment nor reservation could be updated. Payment: ${dto.payment_id}, Reservation: ${dto.reservation_id}`,
        );
      }
    }

    const response: N8nPaymentStatusUpdateResponseDto = {
      success: paymentUpdated || reservationUpdated,
      payment_id: dto.payment_id,
      reservation_id: dto.reservation_id,
      payment_status: paymentStatus,
      reservation_status: reservationStatus,
      message: this.buildStatusMessage(paymentUpdated, reservationUpdated, dto.payment_status),
    };

    this.loggerPort.log(
      `N8n payment status update completed: ${JSON.stringify(response)}`,
      'N8nPaymentWebhook',
    );

    return response;
  }

  private buildStatusMessage(
    paymentUpdated: boolean,
    reservationUpdated: boolean,
    originalStatus: string,
  ): string {
    const updates: string[] = [];
    if (paymentUpdated) updates.push('payment');
    if (reservationUpdated) updates.push('reservation');

    if (updates.length === 0) {
      return `No updates performed for status '${originalStatus}'`;
    }

    return `Successfully updated ${updates.join(' and ')} for status '${originalStatus}'`;
  }
}
