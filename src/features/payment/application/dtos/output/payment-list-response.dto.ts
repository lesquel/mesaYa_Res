import { PaymentDto } from './payment.dto';

export interface PaymentListResponseDto {
  success: boolean;
  message: string;
  data?: PaymentDto[];
}
