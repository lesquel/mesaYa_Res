import type { ILoggerPort } from '@shared/application/ports/logger.port';

<<<<<<< HEAD
=======
import { IPaymentRepositoryPort } from '../../domain/repositories/payment-repository.port';
import {
  PaymentNotFoundError,
  PaymentDeletionFailedError,
} from '../../domain/errors';
>>>>>>> fe5730e (refactor(payment): restructure payment repository ports and mappers)
import { DeletePaymentDto } from '../dtos/input/delete-payment.dto';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { DeletePaymentResponseDto } from '../dtos/output/delete-payment-response.dto';

export class DeletePaymentUseCase
  implements UseCase<DeletePaymentDto, DeletePaymentResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
  ) {}

  async execute(dto: DeletePaymentDto): Promise<DeletePaymentResponseDto> {
    this.logger.log(
      `Attempting to delete payment with ID: ${dto.paymentId}`,
      'DeletePaymentUseCase',
    );

    await this.paymentDomainService.deletePayment(dto.paymentId);

    this.logger.log(
      `Payment successfully deleted with ID: ${dto.paymentId}`,
      'DeletePaymentUseCase',
    );

    return { paymentId: dto.paymentId };
  }
}
