import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { CreateSubscriptionPlanDto } from '../../application/dtos/input/create-subscription-plan.dto.js';

export class CreateSubscriptionPlanRequestDto
  implements CreateSubscriptionPlanDto
{
  @ApiProperty({ description: 'Nombre del plan', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Precio del plan', example: 29.99 })
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Periodo de suscripción (ej. mensual, anual)' })
  @IsString()
  subscriptionPeriod: string;

  @ApiPropertyOptional({ description: 'Estado inicial del plan' })
  @IsOptional()
  @IsString()
  stateSubscriptionPlan?: string;
}
