import { BadRequestException } from '@nestjs/common';
import { parseAnalyticsDate } from '@shared/application/utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import type { SubscriptionPlanAnalyticsQuery } from '@features/subscription/application';
import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';

export class SubscriptionPlanAnalyticsRequestDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del plan',
    enum: SubscriptionPlanStatesEnum,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlanStatesEnum)
  state?: SubscriptionPlanStatesEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por periodo del plan',
    enum: SubscriptionPlanPeriodsEnum,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlanPeriodsEnum)
  period?: SubscriptionPlanPeriodsEnum;

  @ApiPropertyOptional({
    description: 'Fecha inicial de creación del plan (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Alias para startDate (acepta rangeStart en clientes legacy)',
  })
  @IsOptional()
  @IsDateString()
  rangeStart?: string;

  @ApiPropertyOptional({
    description: 'Fecha final de creación del plan (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Alias para endDate (acepta rangeEnd en clientes legacy)',
  })
  @IsOptional()
  @IsDateString()
  rangeEnd?: string;

  @ApiPropertyOptional({
    description: 'Granularity for trend: day|week|month',
    enum: ['day', 'week', 'month'],
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'] as any)
  granularity?: 'day' | 'week' | 'month';

  toQuery(): SubscriptionPlanAnalyticsQuery {
    // Accept both startDate/endDate and legacy rangeStart/rangeEnd
    const rawStart = this.startDate ?? this.rangeStart;
    const rawEnd = this.endDate ?? this.rangeEnd;

    const startDate = rawStart
      ? parseAnalyticsDate(rawStart, false, 'startDate')
      : undefined;
    const endDate = rawEnd
      ? parseAnalyticsDate(rawEnd, true, 'endDate')
      : undefined;

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'startDate debe ser menor o igual que endDate.',
      );
    }

    // enforce reasonable max range (365 days)
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      const maxRange = 365 * 24 * 60 * 60 * 1000;
      if (diff > maxRange) {
        throw new BadRequestException('El rango máximo permitido es 365 días');
      }
    }

    return {
      state: this.state,
      period: this.period,
      startDate,
      endDate,
      granularity: this.granularity ?? 'month',
    } as SubscriptionPlanAnalyticsQuery;
  }
}
