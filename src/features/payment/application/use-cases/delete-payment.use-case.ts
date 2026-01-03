import { Injectable, Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { DeletePaymentDto, DeletePaymentResponseDto } from '../dtos';

@Injectable()
export class DeletePaymentUseCase
  implements UseCase<DeletePaymentDto, DeletePaymentResponseDto>
{
  constructor(
    @Inject(LOGGER)
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
