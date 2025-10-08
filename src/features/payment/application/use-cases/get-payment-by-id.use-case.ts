import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentNotFoundError } from '../../domain/errors';
import { GetPaymentByIdDto } from '../dtos/input/get-payment-by-id.dto';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentEntity } from '@features/payment/domain';

export class GetPaymentByIdUseCase
  implements UseCase<GetPaymentByIdDto, PaymentEntity>
{
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(dto: GetPaymentByIdDto): Promise<PaymentEntity> {
    this.logger.log(
      `Fetching payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    // Buscar la entidad de dominio en el repositorio
    const paymentEntity = await this.paymentRepository.getPaymentById(
      dto.paymentId,
    );

    // Si no existe, lanzar error de dominio
    if (!paymentEntity) {
      this.logger.warn(
        `Payment not found with ID: ${dto.paymentId}`,
        'GetPaymentByIdUseCase',
      );
      throw new PaymentNotFoundError(dto.paymentId);
    }

    this.logger.log(
      `Successfully fetched payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    return paymentEntity;
  }
}
