import { PaymentDto } from './paymentDto';

export interface PaymentListResponseDto {
  success: boolean;
  message: string;
  data?: PaymentDto[];
}
