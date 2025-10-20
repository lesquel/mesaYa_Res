import type { ILoggerPort } from '@shared/application/ports/logger.port';

<<<<<<< HEAD
import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
=======
import { IPaymentRepositoryPort } from '../../domain/repositories/payment-repository.port';
import {
  PaymentNotFoundError,
  PaymentUpdateFailedError,
} from '../../domain/errors';
import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
import { PaymentEntityDTOMapper } from '../mappers/payment.mapper';
>>>>>>> fe5730e (refactor(payment): restructure payment repository ports and mappers)
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

export class UpdatePaymentStatusUseCase
  implements UseCase<UpdatePaymentStatusDto, PaymentDto>
{
  constructor(
    private readonly logger: ILoggerPort,
<<<<<<< HEAD
    private readonly paymentMapper: PaymentEntityDTOMapper,
    private readonly paymentDomainService: PaymentDomainService,
=======

    private readonly paymentRepository: IPaymentRepositoryPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
>>>>>>> fe5730e (refactor(payment): restructure payment repository ports and mappers)
  ) {}

  async execute(dto: UpdatePaymentStatusDto): Promise<PaymentDto> {
    this.logger.log(
      `Updating payment status for ID: ${dto.paymentId} to status: ${dto.status}`,
      'UpdatePaymentStatusUseCase',
    );

    // Usar mapper para transformar DTO a tipo de dominio
    const paymentUpdate =
      this.paymentMapper.fromUpdatePaymentStatusDTOtoPaymentUpdate(dto);

    const updatedPayment =
      await this.paymentDomainService.updatePaymentStatus(paymentUpdate);

    this.logger.log(
      `Payment status updated successfully. New status: ${updatedPayment.paymentStatus.status}`,
      'UpdatePaymentStatusUseCase',
    );

    return this.paymentMapper.fromEntitytoDTO(updatedPayment);
  }
}
