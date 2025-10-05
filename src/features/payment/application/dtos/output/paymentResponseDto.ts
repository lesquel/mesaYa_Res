import { PaymentDto } from './paymentDto';

export interface PaymentResponseDto {
  success: boolean;
  message: string;
  data?: PaymentDto;
}
