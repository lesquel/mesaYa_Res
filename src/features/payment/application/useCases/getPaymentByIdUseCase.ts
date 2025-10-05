import { IPaymentRepository } from '../../domain/repositories/paymentRepository';
import { PaymentEntity } from '../../domain/entities/paymentEntity';
import { GetPaymentByIdDto } from '../dtos/input/getPaymentByIdDto';
import { PaymentResponseDto } from '../dtos/output/paymentResponseDto';
import { PaymentMapper } from '../mappers/paymentMapper';

export class GetPaymentByIdUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(dto: GetPaymentByIdDto): Promise<PaymentResponseDto> {
    try {
      // Validación de entrada
      if (!dto.paymentId || dto.paymentId.trim() === '') {
        return {
          success: false,
          message: 'El ID del pago es requerido',
        };
      }

      // Buscar el pago
      const payment = await this.paymentRepository.getPaymentById(
        dto.paymentId,
      );

      if (!payment) {
        return {
          success: false,
          message: 'Pago no encontrado',
        };
      }

      return {
        success: true,
        message: 'Pago encontrado exitosamente',
        data: PaymentMapper.toDto(payment),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al buscar el pago: ${(error as Error).message}`,
      };
    }
  }
}
