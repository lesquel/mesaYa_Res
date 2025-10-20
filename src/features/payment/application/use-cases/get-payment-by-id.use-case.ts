import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { GetPaymentByIdDto } from '../dtos/input/get-payment-by-id.dto';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

export class GetPaymentByIdUseCase
  implements UseCase<GetPaymentByIdDto, PaymentDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(dto: GetPaymentByIdDto): Promise<PaymentDto> {
    this.logger.log(
      `Fetching payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    const paymentEntity = await this.paymentDomainService.findPaymentById(
      dto.paymentId,
    );

    this.logger.log(
      `Successfully fetched payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    return this.paymentMapper.fromEntitytoDTO(paymentEntity);
  }
}
