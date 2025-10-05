import { Money, PaymentStatus, PaymentType } from '../entities/values';

export interface PaymentCreate {
  paymentId: string;
  payerId: string;
  paymentType: PaymentType;
  targetId: string;
  amount: Money;
  date: Date;
  paymentStatus: PaymentStatus;
}
