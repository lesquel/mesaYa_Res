import { Injectable, Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';

import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

@Injectable()
export class UpdatePaymentStatusUseCase
  implements UseCase<UpdatePaymentStatusDto, PaymentDto>
{
  constructor(
    @Inject(LOGGER)
    private readonly logger: ILoggerPort,
    private readonly paymentMapper: PaymentEntityDTOMapper,
    private readonly paymentDomainService: PaymentDomainService,
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
