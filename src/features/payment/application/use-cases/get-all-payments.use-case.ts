import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

export class GetAllPaymentsUseCase implements UseCase<void, PaymentDto[]> {
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(): Promise<PaymentDto[]> {
    this.logger.log(
      'Fetching all payments from repository',
      'GetAllPaymentsUseCase',
    );

    const paymentEntities = await this.paymentDomainService.findAllPayments();

    this.logger.log(
      `Successfully fetched ${paymentEntities.length} payment(s)`,
      'GetAllPaymentsUseCase',
    );

    return paymentEntities.map((entity) =>
      this.paymentMapper.fromEntitytoDTO(entity),
    );
  }
}
