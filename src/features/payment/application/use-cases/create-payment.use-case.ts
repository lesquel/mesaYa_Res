import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaymentDomainService } from '@features/payment/domain';
import { CreatePaymentDto } from '../dtos/input/create-payment.dto';
import { PaymentEntityDTOMapper } from '../mappers';
import { PaymentDto } from '../dtos/output/payment.dto';

export class CreatePaymentUseCase
  implements UseCase<CreatePaymentDto, PaymentDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentMapper: PaymentEntityDTOMapper,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentDto> {
    this.logger.log(
      `Creating payment for targetId: ${dto.reservationId ? dto.reservationId : dto.subscriptionId}, amount: ${dto.amount}`,
      'CreatePaymentUseCase',
    );

    const registrationRequest = this.paymentMapper.toRegistrationRequest(dto);

    const registrationResult =
      await this.paymentDomainService.registerPayment(registrationRequest);

    this.logger.log(
      `Payment ${registrationResult.payment.id} persisted for target ${registrationResult.ledger.target.id} with status ${registrationResult.payment.paymentStatus.status}`,
      'CreatePaymentUseCase',
    );

    if (registrationResult.settlesTarget) {
      this.logger.log(
        `Target ${registrationResult.ledger.target.id} fully settled after payment ${registrationResult.payment.id}`,
        'CreatePaymentUseCase',
      );
    }

    return this.paymentMapper.fromEntitytoDTO(registrationResult.payment);
  }
}
