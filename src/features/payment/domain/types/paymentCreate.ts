import { MoneyVO, PaymentStatusVO } from '../entities/values';

export interface PaymentCreate {
  reservationId?: string;
  subscriptionId?: string;
  amount: MoneyVO;
  paymentStatus: PaymentStatusVO;
}
