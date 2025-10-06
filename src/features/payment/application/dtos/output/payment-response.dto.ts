import { PaymentDto } from './payment.dto';

export interface PaymentResponseDto {
  success: boolean;
  message: string;
  data?: PaymentDto;
}
