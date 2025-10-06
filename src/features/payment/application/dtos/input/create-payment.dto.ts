export interface CreatePaymentDto {
  payerId: string;
  paymentType: string;
  targetId: string;
  amount: number;
}
