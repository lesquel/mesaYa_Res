import { IPaymentRepository } from '../../domain/repositories/paymentRepository';
import { DeletePaymentDto } from '../dtos/input/deletePaymentDto';
import { DeletePaymentResponseDto } from '../dtos/output/deletePaymentResponseDto';

export class DeletePaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(dto: DeletePaymentDto): Promise<DeletePaymentResponseDto> {
    try {
      // Validación de entrada
      if (!dto.paymentId || dto.paymentId.trim() === '') {
        return {
          success: false,
          message: 'El ID del pago es requerido',
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

      // Eliminar el pago
      const deleted = await this.paymentRepository.deletePayment(dto.paymentId);

      if (!deleted) {
        return {
          success: false,
          message: 'Error al eliminar el pago',
        };
      }

      return {
        success: true,
        message: 'Pago eliminado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar el pago: ${(error as Error).message}`,
      };
    }
  }
}
