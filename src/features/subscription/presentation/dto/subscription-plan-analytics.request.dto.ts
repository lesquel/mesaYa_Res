import { BadRequestException } from '@nestjs/common';
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
    description: 'Fecha final de creación del plan (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  toQuery(): SubscriptionPlanAnalyticsQuery {
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
      state: this.state,
      period: this.period,
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
