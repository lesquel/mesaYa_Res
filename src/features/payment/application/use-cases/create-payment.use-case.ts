import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentEntity } from '../../domain/entities/paymentEntity';
import {
  Money,
  PaymentStatus,
  PaymentType,
} from '../../domain/entities/values';
import { CreatePaymentDto } from '../dtos/input/create-payment.dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      // Validaciones de entrada
      if (!dto.payerId || dto.payerId.trim() === '') {
        return {
          success: false,
          message: 'El ID del pagador es requerido',
        };
      }

      if (!dto.targetId || dto.targetId.trim() === '') {
        return {
          success: false,
          message: 'El ID objetivo es requerido',
        };
      }

      if (dto.amount <= 0) {
        return {
          success: false,
          message: 'El monto debe ser mayor a 0',
        };
      }

      // Crear value objects
      const money = new Money(dto.amount);
      const paymentType = new PaymentType(dto.paymentType);
      const paymentStatus = new PaymentStatus('PENDING');
      const paymentId = `PAY-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Crear datos para el repositorio
      const paymentData = {
        paymentId,
        payerId: dto.payerId,
        paymentType,
        targetId: dto.targetId,
        amount: money,
        date: new Date(),
        paymentStatus,
      };

      // Crear el pago usando el repositorio
      const newPayment = await this.paymentRepository.createPayment(
        paymentData,
        (error: Error | null, result: PaymentEntity | null) => {
          if (error) {
            console.error('Error en callback:', error);
          }
        },
      );

      return {
        success: true,
        message: 'Pago creado exitosamente',
        data: PaymentMapper.toDTO(newPayment),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al crear el pago: ${(error as Error).message}`,
      };
    }
  }
}
