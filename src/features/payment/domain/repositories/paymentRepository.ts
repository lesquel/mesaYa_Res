import { PaymentEntity } from '../entities/paymentEntity';
import { PaymentUpdate, PaymentCreate } from '../types';

export abstract class IPaymentRepository {
  abstract createPayment(
    data: PaymentCreate,
    callback: CallableFunction,
  ): Promise<PaymentEntity>;

  abstract updatePayment(data: PaymentUpdate): Promise<PaymentEntity | null>;

  abstract getPaymentById(paymentId: string): Promise<PaymentEntity | null>;

  abstract getAllPayments(): Promise<PaymentEntity[]>;

  abstract deletePayment(paymentId: string): Promise<boolean>;
}
