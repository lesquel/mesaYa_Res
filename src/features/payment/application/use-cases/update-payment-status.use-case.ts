import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepositoryPort } from '../../domain/repositories/payment-repository.port';
import {
  PaymentNotFoundError,
  PaymentUpdateFailedError,
} from '../../domain/errors';
import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
import { PaymentEntityDTOMapper } from '../mappers/payment.mapper';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentEntity } from '@features/payment/domain';

export class UpdatePaymentStatusUseCase
  implements UseCase<UpdatePaymentStatusDto, PaymentEntity>
{
  constructor(
    private readonly logger: ILoggerPort,

    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(dto: UpdatePaymentStatusDto): Promise<PaymentEntity> {
    this.logger.log(
      `Updating payment status for ID: ${dto.paymentId} to status: ${dto.status}`,
      'UpdatePaymentStatusUseCase',
    );

    // Verificar que el pago existe
    const existingPayment = await this.paymentRepository.findById(
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

    // Usar mapper para transformar DTO a tipo de dominio
    const paymentUpdate =
      this.paymentMapper.fromUpdatePaymentStatusDTOtoPaymentUpdate(dto);

    // Actualizar el pago en el repositorio
    const updatedPayment = await this.paymentRepository.update(paymentUpdate);

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
      `Payment status updated successfully. New status: ${updatedPayment.paymentStatus.status}`,
      'UpdatePaymentStatusUseCase',
    );

    return updatedPayment;
  }
}
