import { Injectable, Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';

import { DeletePaymentDto } from '../dtos/input/delete-payment.dto';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { DeletePaymentResponseDto } from '../dtos/output/delete-payment-response.dto';

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
