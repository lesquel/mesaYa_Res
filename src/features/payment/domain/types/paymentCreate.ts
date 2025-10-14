import { MoneyVO } from '@shared/domain/entities/values';
import { PaymentStatusVO } from '../entities/values';

export interface PaymentCreate {
  reservationId?: string;
  subscriptionId?: string;
  amount: MoneyVO;
  paymentStatus: PaymentStatusVO;
}
