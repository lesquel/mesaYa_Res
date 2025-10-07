import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentStatus } from '../../domain/entities/values';
import { UpdatePaymentStatusDto } from '../dtos/input/update-payment-status-dto';
import { PaymentResponseDto } from '../dtos/output/payment-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class UpdatePaymentStatusUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(dto: UpdatePaymentStatusDto): Promise<PaymentResponseDto> {
    try {
      // Validaciones de entrada
      if (!dto.paymentId || dto.paymentId.trim() === '') {
        return {
          success: false,
          message: 'El ID del pago es requerido',
        };
      }

      if (!dto.status || dto.status.trim() === '') {
        return {
          success: false,
          message: 'El estado del pago es requerido',
        };
      }

      // Verificar que el pago existe
      const existingPayment = await this.paymentRepository.getPaymentById(
        dto.paymentId,
      );
      if (!existingPayment) {
        return {
          success: false,
          message: 'Pago no encontrado',
        };
      }

      // Crear el nuevo estado
      const newStatus = new PaymentStatus(dto.status);

      // Actualizar el pago
      const updatedPayment = await this.paymentRepository.updatePayment({
        paymentId: dto.paymentId,
        status: newStatus,
      });

      if (!updatedPayment) {
        return {
          success: false,
          message: 'Error al actualizar el pago',
        };
      }

      return {
        success: true,
        message: 'Estado del pago actualizado exitosamente',
        data: PaymentMapper.toDTO(updatedPayment),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar el pago: ${(error as Error).message}`,
      };
    }
  }
}
