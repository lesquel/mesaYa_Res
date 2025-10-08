import {
  PaymentCreate,
  PaymentEntity,
  PaymentUpdate,
} from '@features/payment/domain';

export abstract class IPaymentRepository {
  abstract createPayment(data: PaymentCreate): Promise<PaymentEntity>;

  abstract updatePayment(data: PaymentUpdate): Promise<PaymentEntity | null>;

  abstract getPaymentById(paymentId: string): Promise<PaymentEntity | null>;

  abstract getAllPayments(): Promise<PaymentEntity[]>;

  abstract deletePayment(paymentId: string): Promise<boolean>;
}
