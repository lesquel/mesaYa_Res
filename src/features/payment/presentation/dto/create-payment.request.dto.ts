import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreatePaymentDto } from '../../application/dtos/input/create-payment.dto';

export class CreatePaymentRequestDto implements CreatePaymentDto {
  @ApiPropertyOptional({
    description: 'Reserva asociada al pago',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiPropertyOptional({
    description: 'Suscripción asociada al pago',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @ApiProperty({ description: 'Monto del pago', example: 100.5 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Importe total esperado para el objetivo del pago',
    example: 100.5,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  expectedTotal?: number;

  @ApiPropertyOptional({
    description: 'Permitir pagos parciales para el objetivo',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowPartialPayments?: boolean;
}
