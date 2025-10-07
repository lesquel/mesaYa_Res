import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentStatus } from '../../domain/entities/values';
import {
  PaymentNotFoundError,
  PaymentUpdateFailedError,
} from '../../domain/errors';
import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class UpdatePaymentStatusUseCase {
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async execute(dto: UpdatePaymentStatusDto): Promise<PaymentResponseDto> {
    this.logger.log(
      `Updating payment status for ID: ${dto.paymentId} to status: ${dto.status}`,
      'UpdatePaymentStatusUseCase',
    );

    // Verificar que el pago existe
    const existingPayment = await this.paymentRepository.getPaymentById(
      dto.paymentId,
    );

    if (!existingPayment) {
      this.logger.warn(
        `Payment not found with ID: ${dto.paymentId}`,
        'UpdatePaymentStatusUseCase',
      );
      throw new PaymentNotFoundError(dto.paymentId);
    }

    this.logger.log(
      `Payment found. Current status: ${existingPayment.paymentStatus.status}`,
      'UpdatePaymentStatusUseCase',
    );

    // Crear el nuevo Value Object de estado
    const newStatus = new PaymentStatus(dto.status);

    // Actualizar el pago en el repositorio
    const updatedPayment = await this.paymentRepository.updatePayment({
      paymentId: dto.paymentId,
      status: newStatus,
    });

    if (!updatedPayment) {
      this.logger.error(
        `Failed to update payment with ID: ${dto.paymentId}`,
        undefined,
        'UpdatePaymentStatusUseCase',
      );
      throw new PaymentUpdateFailedError(
        dto.paymentId,
        'Repository returned null',
      );
    }

    this.logger.log(
      `Payment status updated successfully. New status: ${newStatus.status}`,
      'UpdatePaymentStatusUseCase',
    );

    // Transformar entidad a DTO usando mapper
    return {
      success: true,
      message: 'Estado del pago actualizado exitosamente',
      data: this.paymentMapper.toDTO(updatedPayment),
    };
  }
}
