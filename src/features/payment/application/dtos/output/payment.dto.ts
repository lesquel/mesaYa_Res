export interface PaymentDto {
  paymentId: string;
  payerId: string;
  paymentType: string;
  targetId: string;
  amount: number;
  date: string;
  paymentStatus: string;
}
