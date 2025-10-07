import { Inject } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';

import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentCreationFailedError } from '../../domain/errors';
import { CreatePaymentDto } from '../dtos/input/create-payment.dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class CreatePaymentUseCase {
  constructor(
    @Inject('ILogger') private readonly logger: ILoggerPort,
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentMapper: PaymentMapper,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    this.logger.log(
      `Creating payment for payerId: ${dto.payerId}, amount: ${dto.amount}, type: ${dto.paymentType}`,
      'CreatePaymentUseCase',
    );

    // Generar ID único del pago
    const paymentId = this.generatePaymentId();

    // Usar mapper para transformar DTO a Entidad de dominio
    const paymentEntity = this.paymentMapper.toDomain({
      paymentId,
      payerId: dto.payerId,
      paymentType: dto.paymentType,
      targetId: dto.targetId,
      amount: dto.amount,
      date: new Date().toISOString(),
      paymentStatus: 'PENDING',
    });

    this.logger.log(
      `Persisting payment with ID: ${paymentId}`,
      'CreatePaymentUseCase',
    );

    // Persistir en el repositorio
    const createdPayment = await this.paymentRepository.createPayment(
      paymentEntity,
      (error: Error | null) => {
        if (error) {
          this.logger.error(
            `Repository callback error: ${error.message}`,
            error.stack,
            'CreatePaymentUseCase',
          );
        }
      },
    );

    if (!createdPayment) {
      throw new PaymentCreationFailedError('Repository returned null', {
        paymentId,
        payerId: dto.payerId,
      });
    }

    this.logger.log(
      `Payment created successfully with ID: ${createdPayment.paymentId}`,
      'CreatePaymentUseCase',
    );

    // Transformar a DTO de salida usando mapper
    return {
      success: true,
      message: 'Pago creado exitosamente',
      data: this.paymentMapper.toDTO(createdPayment),
    };
  }

  private generatePaymentId(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
