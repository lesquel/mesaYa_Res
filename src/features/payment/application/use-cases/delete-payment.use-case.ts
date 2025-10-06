import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { DeletePaymentDto } from '../dtos/input/delete-payment.dto';
import { DeletePaymentResponseDto } from '../dtos/output/delete-payment-response.dto';

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
