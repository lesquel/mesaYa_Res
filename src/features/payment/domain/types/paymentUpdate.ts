import { PaymentStatusVO } from '../entities/values';

export interface PaymentUpdate {
  paymentId: string;
  status: PaymentStatusVO;
}
