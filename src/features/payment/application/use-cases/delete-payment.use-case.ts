import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import {
  PaymentNotFoundError,
  PaymentDeletionFailedError,
} from '../../domain/errors';
import { DeletePaymentDto } from '../dtos/input/delete-payment.dto';
import { UseCase } from '@shared/application/ports/use-case.port';

export class DeletePaymentUseCase implements UseCase<DeletePaymentDto, void> {
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(dto: DeletePaymentDto): Promise<void> {
    this.logger.log(
      `Attempting to delete payment with ID: ${dto.paymentId}`,
      'DeletePaymentUseCase',
    );

    // Verificar que el pago existe
    const existingPayment = await this.paymentRepository.getPaymentById(
      dto.paymentId,
    );

    if (!existingPayment) {
      this.logger.warn(
        `Payment not found with ID: ${dto.paymentId}`,
        'DeletePaymentUseCase',
      );
      throw new PaymentNotFoundError(dto.paymentId);
    }

    this.logger.log(
      `Payment found with ID: ${dto.paymentId}. Proceeding with deletion`,
      'DeletePaymentUseCase',
    );

    // Eliminar el pago del repositorio
    const deleted = await this.paymentRepository.deletePayment(dto.paymentId);

    if (!deleted) {
      this.logger.error(
        `Failed to delete payment with ID: ${dto.paymentId}`,
        undefined,
        'DeletePaymentUseCase',
      );
      throw new PaymentDeletionFailedError(
        dto.paymentId,
        'Repository returned false',
      );
    }

    this.logger.log(
      `Payment successfully deleted with ID: ${dto.paymentId}`,
      'DeletePaymentUseCase',
    );
  }
}
