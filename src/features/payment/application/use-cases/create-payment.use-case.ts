import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';

import { IPaymentRepositoryPort } from '../../domain/repositories/payment-repository.port';
import { PaymentEntity, PaymentCreate } from '@features/payment/domain';
import { PaymentCreationFailedError } from '../../domain/errors';
import { CreatePaymentDto } from '../dtos/input/create-payment.dto';
import { PaymentEntityDTOMapper } from '../mappers';

export class CreatePaymentUseCase
  implements UseCase<CreatePaymentDto, PaymentEntity>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentEntity> {
    this.logger.log(
      `Creating payment for targetId: ${dto.reservationId ? dto.reservationId : dto.subscriptionId}, amount: ${dto.amount}`,
      'CreatePaymentUseCase',
    );

    // Usar mapper para transformar DTO a Entidad de dominio
    const paymentCreate: PaymentCreate =
      this.paymentMapper.fromCreatePaymentDTOtoPaymentCreate(dto);

    // Persistir en el repositorio
    const createdPayment = await this.paymentRepository.create(paymentCreate);

    this.logger.log(
      `Persisting payment with ID: ${createdPayment?.id}`,
      'CreatePaymentUseCase',
    );
    if (!createdPayment) {
      throw new PaymentCreationFailedError(
        'Failed to create payment in the repository',
        {
          targetId: dto.reservationId ? dto.reservationId : dto.subscriptionId,
        },
      );
    }

    this.logger.log(
      `Payment created successfully with ID: ${createdPayment.id}`,
      'CreatePaymentUseCase',
    );

    return createdPayment;
  }
}
