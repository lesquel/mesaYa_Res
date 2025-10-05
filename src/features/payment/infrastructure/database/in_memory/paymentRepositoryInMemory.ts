import { PaymentEntity } from '../../../domain/entities/paymentEntity';
import { IPaymentRepository } from '../../../domain/repositories/paymentRepository';
import { PaymentCreate, PaymentUpdate } from '../../../domain/types';

export class PaymentRepositoryMemory extends IPaymentRepository {
  private payments: PaymentEntity[] = [];

  createPayment(
    data: PaymentCreate,
    callback: (error: Error | null, result: PaymentEntity | null) => void,
  ): Promise<PaymentEntity> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (
            !data.paymentId ||
            !data.payerId ||
            !data.paymentType ||
            !data.targetId ||
            !data.amount ||
            !data.date ||
            !data.paymentStatus
          ) {
            throw new Error('Datos incompletos para crear el pago');
          }

          const newPayment = new PaymentEntity(
            data.paymentId,
            data.payerId,
            data.paymentType,
            data.targetId,
            data.amount,
            data.date,
            data.paymentStatus,
          );

          this.payments.push(newPayment);

          callback(null, newPayment);
          resolve(newPayment);
        } catch (err) {
          callback(err as Error, null);
          resolve(null as any);
        }
      }, 300);
    });
  }

  updatePayment(data: PaymentUpdate): Promise<PaymentEntity | null> {
    return new Promise((resolve, reject) => {
      try {
        const payment = this.payments.find(
          (p) => p.paymentId === data.paymentId,
        );
        if (!payment) {
          reject(new Error('Pago no encontrado'));
          return;
        }

        payment.updateStatus(data.status);

        resolve(payment);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getPaymentById(paymentId: string): Promise<PaymentEntity | null> {
    try {
      const payment = this.payments.find((p) => p.paymentId === paymentId);
      return payment || null;
    } catch (err) {
      console.error('Error al consultar pago:', err);
      return null;
    }
  }

  async getAllPayments(): Promise<PaymentEntity[]> {
    try {
      return [...this.payments];
    } catch (err) {
      console.error('Error al listar pagos:', err);
      return [];
    }
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const index = this.payments.findIndex((p) => p.paymentId === paymentId);
      if (index === -1) return false;

      this.payments.splice(index, 1);
      return true;
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      return false;
    }
  }
}
