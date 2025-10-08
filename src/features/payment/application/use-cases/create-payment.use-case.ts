import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentCreate } from '@features/payment/domain';
import { PaymentCreationFailedError } from '../../domain/errors';
import { CreatePaymentDto } from '../dtos/input/create-payment.dto';
import { PaymentEntity } from '@features/payment/domain';
import { PaymentMapper } from '../mappers';
import { UseCase } from '@shared/application/ports/use-case.port';

export class CreatePaymentUseCase
  implements UseCase<CreatePaymentDto, PaymentEntity>
{
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentEntity> {
    this.logger.log(
      `Creating payment for payerId: ${dto.payerId}, amount: ${dto.amount}, type: ${dto.paymentType}`,
      'CreatePaymentUseCase',
    );

    // Usar mapper para transformar DTO a Entidad de dominio
    const paymentCreate: PaymentCreate =
      this.paymentMapper.fromCreatePaymentDTOtoPaymentCreate(dto);

    // Persistir en el repositorio
    const createdPayment =
      await this.paymentRepository.createPayment(paymentCreate);

    this.logger.log(
      `Persisting payment with ID: ${createdPayment?.paymentId}`,
      'CreatePaymentUseCase',
    );
    if (!createdPayment) {
      throw new PaymentCreationFailedError('Repository returned null', {
        payerId: dto.payerId,
      });
    }

    this.logger.log(
      `Payment created successfully with ID: ${createdPayment.paymentId}`,
      'CreatePaymentUseCase',
    );

    // Transformar a DTO de salida usando mapper
    return createdPayment;
  }
}
