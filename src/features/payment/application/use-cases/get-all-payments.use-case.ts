import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentListResponseDto } from '../dtos/output/payment-list-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class GetAllPaymentsUseCase {
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async execute(): Promise<PaymentListResponseDto> {
    this.logger.log(
      'Fetching all payments from repository',
      'GetAllPaymentsUseCase',
    );

    // Obtener todas las entidades de dominio del repositorio
    const paymentEntities = await this.paymentRepository.getAllPayments();

    this.logger.log(
      `Successfully fetched ${paymentEntities.length} payment(s)`,
      'GetAllPaymentsUseCase',
    );

    // Transformar entidades a DTOs usando mapper
    const paymentDtos = this.paymentMapper.toDTOList(paymentEntities);

    return {
      success: true,
      message:
        paymentEntities.length > 0
          ? 'Pagos obtenidos exitosamente'
          : 'No se encontraron pagos',
      data: paymentDtos,
    };
  }
}
