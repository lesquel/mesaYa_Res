import type { MoneyVO } from '@shared/domain/entities/values';
import type { PaymentStatusVO } from '../entities/values';

export interface PaymentProps {
  amount: MoneyVO;
  date: Date;
  paymentStatus: PaymentStatusVO;
  reservationId?: string;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSnapshot extends PaymentProps {
  paymentId: string;
}
