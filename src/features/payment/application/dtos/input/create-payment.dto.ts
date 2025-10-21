export interface CreatePaymentDto {
  reservationId?: string;
  subscriptionId?: string;
  amount: number;
  expectedTotal?: number;
  allowPartialPayments?: boolean;
}
