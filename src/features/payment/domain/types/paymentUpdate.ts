import { PaymentStatus } from '../entities/values';

export interface PaymentUpdate {
  paymentId: string;
  status: PaymentStatus;
}
