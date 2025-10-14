import { Money, PaymentStatus } from '../entities/values';

export interface PaymentCreate {
  reservationId?: string;
  subscriptionId?: string;
  amount: Money;
  paymentStatus: PaymentStatus;
}
