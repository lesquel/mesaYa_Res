import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatusEnum } from '@features/payment/domain/enums/index';
import type { PaymentDto } from '../../application/dtos/output/payment.dto';

export class PaymentResponseSwaggerDto implements PaymentDto {
  @ApiProperty({ format: 'uuid', required: false })
  paymentId?: string;

  @ApiProperty({
    description: 'Relacionado a la reservación',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  reservationId?: string | undefined;

  @ApiProperty({
    description: 'Relacionado a la suscripción',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  subscriptionId?: string | undefined;

  @ApiProperty({ description: 'Monto pagado', example: 100.5 })
  amount: number;

  @ApiProperty({
    description: 'Fecha del pago en formato ISO 8601',
    example: '2025-01-01T12:00:00.000Z',
  })
  date: string;

  @ApiProperty({
    enum: PaymentStatusEnum,
    description: 'Estado actual del pago',
  })
  paymentStatus: PaymentStatusEnum;
}
