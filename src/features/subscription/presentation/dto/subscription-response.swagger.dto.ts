import { ApiProperty } from '@nestjs/swagger';
import type { SubscriptionDto } from '../../application/dtos/output/subscription.dto';

export class SubscriptionResponseSwaggerDto implements SubscriptionDto {
  @ApiProperty({
    description: 'Identificador de la suscripción',
    format: 'uuid',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Identificador del plan',
    format: 'uuid',
  })
  subscriptionPlanId: string;

  @ApiProperty({
    description: 'Identificador del restaurante',
    format: 'uuid',
  })
  restaurantId: string;

  @ApiProperty({
    description: 'Fecha de inicio de la suscripción en formato ISO 8601',
    example: '2025-01-01T00:00:00.000Z',
  })
  subscriptionStartDate: string;

  @ApiProperty({ description: 'Estado actual de la suscripción' })
  stateSubscription: string;

  @ApiProperty({ description: 'Fecha de creación de la suscripción' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la suscripción',
  })
  updatedAt: Date;
}
