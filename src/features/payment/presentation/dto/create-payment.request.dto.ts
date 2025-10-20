import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import type { CreatePaymentDto } from '../../application/dtos/input/create-payment.dto.js';

export class CreatePaymentRequestDto implements CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Reserva asociada al pago',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  reservationId!: string;

  @ApiPropertyOptional({
    description: 'Suscripción asociada al pago',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subscriptionId!: string;

  @ApiProperty({ description: 'Monto del pago', example: 100.5 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}
