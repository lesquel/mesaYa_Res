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

    // Usar mapper para transformar DTO a Entidad de dominio
    const paymentCreate =
      this.paymentMapper.fromCreatePaymentDTOtoPaymentCreate(dto);

    // Persistir en el repositorio a través del servicio de dominio
    const createdPayment =
      await this.paymentDomainService.createPayment(paymentCreate);

    this.logger.log(
      `Persisting payment with ID: ${createdPayment?.id}`,
      'CreatePaymentUseCase',
    );

    this.logger.log(
      `Payment created successfully with ID: ${createdPayment.id}`,
      'CreatePaymentUseCase',
    );

    return this.paymentMapper.fromEntitytoDTO(createdPayment);
  }
}
