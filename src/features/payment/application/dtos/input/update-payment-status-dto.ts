import { PaymentStatusEnum } from '@features/payment/domain/enums';

export interface UpdatePaymentStatusDto {
  paymentId: string;
  status: PaymentStatusEnum;
}
