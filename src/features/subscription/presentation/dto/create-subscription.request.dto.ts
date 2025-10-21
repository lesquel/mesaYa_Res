import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import type { CreateSubscriptionDto } from '../../application/dtos/input/create-subscription.dto';

export class CreateSubscriptionRequestDto implements CreateSubscriptionDto {
  @ApiProperty({
    description: 'Identificador del plan de suscripción',
    format: 'uuid',
  })
  @IsUUID()
  subscriptionPlanId: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    format: 'uuid',
  })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({
    description: 'Fecha de inicio en formato ISO 8601',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsISO8601()
  subscriptionStartDate: string;

  @ApiPropertyOptional({ description: 'Estado inicial de la suscripción' })
  @IsOptional()
  @IsString()
  stateSubscription?: string;
}
