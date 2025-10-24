import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import type { SubscriptionAnalyticsQuery } from '@features/subscription/application';
import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionStatesEnum,
} from '@features/subscription/domain/enums';

export class SubscriptionAnalyticsRequestDto {
  @ApiPropertyOptional({
    description: 'Filtrar por plan de suscripción',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subscriptionPlanId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por restaurante',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la suscripción',
    enum: SubscriptionStatesEnum,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatesEnum)
  state?: SubscriptionStatesEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por periodo del plan',
    enum: SubscriptionPlanPeriodsEnum,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlanPeriodsEnum)
  subscriptionPeriod?: SubscriptionPlanPeriodsEnum;

  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  toQuery(): SubscriptionAnalyticsQuery {
    const startDate = this.startDate
      ? this.parseDate(this.startDate, false, 'startDate')
      : undefined;
    const endDate = this.endDate
      ? this.parseDate(this.endDate, true, 'endDate')
      : undefined;

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'startDate debe ser menor o igual que endDate.',
      );
    }

    return {
      subscriptionPlanId: this.subscriptionPlanId,
      restaurantId: this.restaurantId,
      state: this.state,
      subscriptionPeriod: this.subscriptionPeriod,
      startDate,
      endDate,
    };
  }

  private parseDate(
    value: string,
    endOfDay: boolean,
    field: 'startDate' | 'endDate',
  ): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${field} debe ser una fecha ISO válida.`);
    }

    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }

    return parsed;
  }
}
