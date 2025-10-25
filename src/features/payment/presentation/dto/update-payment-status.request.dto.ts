import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PaymentStatusEnum } from '@features/payment/domain/enums';
import type { UpdatePaymentStatusDto } from '../../application/dtos/input/update-payment-status-dto';

export class UpdatePaymentStatusRequestDto implements UpdatePaymentStatusDto {
  @ApiProperty({
    enum: PaymentStatusEnum,
    description: 'Nuevo estado del pago',
  })
  @IsEnum(PaymentStatusEnum)
  status: PaymentStatusEnum;

  paymentId!: string;
}
