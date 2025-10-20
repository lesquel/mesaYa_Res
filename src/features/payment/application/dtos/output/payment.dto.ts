import { PaymentStatusEnum } from '@features/payment/domain/enums';

export interface PaymentDto {
  paymentId?: string;
  reservationId?: string | undefined;
  subscriptionId?: string | undefined;
  amount: number;
  date: string;
  paymentStatus: PaymentStatusEnum;
}
