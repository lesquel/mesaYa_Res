import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentEntity } from '../../domain/entities/paymentEntity';
import { GetPaymentByIdDto } from '../dtos/input/get-payment-by-id.dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

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
        data: PaymentMapper.toDTO(payment),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al buscar el pago: ${(error as Error).message}`,
      };
    }
  }
}
