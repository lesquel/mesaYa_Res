import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentNotFoundError } from '../../domain/errors';
import { GetPaymentByIdDto } from '../dtos/input/get-payment-by-id.dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class GetPaymentByIdUseCase {
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async execute(dto: GetPaymentByIdDto): Promise<PaymentResponseDto> {
    this.logger.log(
      `Fetching payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    // Buscar la entidad de dominio en el repositorio
    const paymentEntity = await this.paymentRepository.getPaymentById(
      dto.paymentId,
    );

    // Si no existe, lanzar error de dominio
    if (!paymentEntity) {
      this.logger.warn(
        `Payment not found with ID: ${dto.paymentId}`,
        'GetPaymentByIdUseCase',
      );
      throw new PaymentNotFoundError(dto.paymentId);
    }

    this.logger.log(
      `Successfully fetched payment with ID: ${dto.paymentId}`,
      'GetPaymentByIdUseCase',
    );

    // Transformar entidad a DTO usando mapper
    return {
      success: true,
      message: 'Pago encontrado exitosamente',
      data: this.paymentMapper.toDTO(paymentEntity),
    };
  }
}
