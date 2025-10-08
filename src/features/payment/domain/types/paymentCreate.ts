import { Money, PaymentStatus, PaymentType } from '../entities/values';

export interface PaymentCreate {
  payerId: string;
  paymentType: PaymentType;
  targetId: string;
  amount: Money;
  paymentStatus: PaymentStatus;
}
