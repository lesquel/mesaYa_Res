import { ApiProperty } from '@nestjs/swagger';
import type { SubscriptionPlanDto } from '../../application/dtos/output/subscription-plan.dto.js';

export class SubscriptionPlanResponseSwaggerDto implements SubscriptionPlanDto {
  @ApiProperty({
    description: 'Identificador del plan',
    format: 'uuid',
  })
  subscriptionPlanId: string;

  @ApiProperty({ description: 'Nombre del plan' })
  name: string;

  @ApiProperty({ description: 'Precio del plan', example: 29.99 })
  price: number;

  @ApiProperty({ description: 'Periodo de facturación' })
  subscriptionPeriod: string;

  @ApiProperty({ description: 'Estado del plan', example: 'ACTIVE' })
  stateSubscriptionPlan: string;
}
