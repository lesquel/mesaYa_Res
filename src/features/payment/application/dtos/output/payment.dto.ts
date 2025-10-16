export interface PaymentDto {
  paymentId?: string;
  reservationId?: string | undefined;
  subscriptionId?: string | undefined;
  amount: number;
  date: string;
  paymentStatus: string;
}
