import {
  IPaymentRepositoryPort,
  PaymentEntity,
  PaymentCreate,
  PaymentUpdate,
  PaymentNotFoundError,
  PaymentCreationFailedError,
  PaymentUpdateFailedError,
  PaymentDeletionFailedError,
} from '@features/payment/domain';

export class PaymentDomainService {
  constructor(private readonly paymentRepository: IPaymentRepositoryPort) {}

  async createPayment(data: PaymentCreate): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.create(data);

    if (!payment) {
      throw new PaymentCreationFailedError('Repository returned null', {
        targetId: data.reservationId ?? data.subscriptionId,
      });
    }

    return payment;
  }

  async findPaymentById(paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }

    return payment;
  }

  async findAllPayments(): Promise<PaymentEntity[]> {
    return this.paymentRepository.findAll();
  }

  async updatePaymentStatus(data: PaymentUpdate): Promise<PaymentEntity> {
    const updatedPayment = await this.paymentRepository.update(data);

    if (!updatedPayment) {
      throw new PaymentUpdateFailedError(
        data.paymentId,
        'Repository returned null',
      );
    }

    return updatedPayment;
  }

  async deletePayment(paymentId: string): Promise<void> {
    const deleted = await this.paymentRepository.delete(paymentId);

    if (!deleted) {
      throw new PaymentDeletionFailedError(
        paymentId,
        'Repository returned false',
      );
    }
  }
}
