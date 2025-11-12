import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import type { RestaurantAnalyticsQuery } from '../../application/dto/analytics/restaurant-analytics.query';

export class RestaurantAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Granularity for trend: day|week|month', enum: ['day', 'week', 'month'] })
  @IsOptional()
  granularity?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ description: 'Filtrar por estado activo' })
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por propietario',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por plan de suscripción' })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  toQuery(): RestaurantAnalyticsQuery {
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

    // enforce max range (365 days)
    if (startDate && endDate) {
      const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const MAX_RANGE_DAYS = 365;
      if (diff > MAX_RANGE_DAYS) {
        throw new BadRequestException(
          `Rango máximo permitido es ${MAX_RANGE_DAYS} días.`,
        );
      }
    }

    return {
      startDate,
      endDate,
      active:
        this.active !== undefined
          ? this.active.toLowerCase() === 'true'
          : undefined,
      ownerId: this.ownerId,
      subscriptionId: this.subscriptionId,
      granularity: this.granularity ?? 'month',
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
