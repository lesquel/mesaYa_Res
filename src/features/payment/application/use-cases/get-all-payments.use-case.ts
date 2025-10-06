import { IPaymentRepository } from '../ports/repositories/payment-repository.port';
import { PaymentListResponseDto } from '../dtos/output/payment-list-response.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

export class GetAllPaymentsUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(): Promise<PaymentListResponseDto> {
    try {
      // Obtener todos los pagos
      const payments = await this.paymentRepository.getAllPayments();

      return {
        success: true,
        message:
          payments.length > 0
            ? 'Pagos obtenidos exitosamente'
            : 'No se encontraron pagos',
        data: PaymentMapper.toDtoList(payments),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener los pagos: ${(error as Error).message}`,
      };
    }
  }
}
