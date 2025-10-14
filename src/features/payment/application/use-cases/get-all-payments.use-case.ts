import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentEntity } from '@features/payment/domain';

export class GetAllPaymentsUseCase implements UseCase<void, PaymentEntity[]> {
  constructor(
    private readonly logger: ILoggerPort,

    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(): Promise<PaymentEntity[]> {
    this.logger.log(
      'Fetching all payments from repository',
      'GetAllPaymentsUseCase',
    );

    // Obtener todas las entidades de dominio del repositorio
    const paymentEntities = await this.paymentRepository.getAllPayments();

    this.logger.log(
      `Successfully fetched ${paymentEntities.length} payment(s)`,
      'GetAllPaymentsUseCase',
    );

    return paymentEntities;
  }
}
