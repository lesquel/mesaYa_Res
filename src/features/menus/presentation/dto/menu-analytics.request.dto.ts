import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import type { MenuAnalyticsQuery } from '../../application/dtos/analytics/menu-analytics.query';

export class MenuAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Identificador del restaurante' })
  @IsOptional()
  @IsInt()
  @Min(1)
  restaurantId?: number;

  @ApiPropertyOptional({ description: 'Precio mínimo a considerar' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Precio máximo a considerar' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  toQuery(): MenuAnalyticsQuery {
    const startDate = this.startDate
      ? this.parseDate(this.startDate, false, 'startDate')
      : undefined;
    const endDate = this.endDate
      ? this.parseDate(this.endDate, true, 'endDate')
      : undefined;

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'startDate debe ser menor o igual que endDate',
      );
    }

    if (
      typeof this.minPrice === 'number' &&
      typeof this.maxPrice === 'number' &&
      this.minPrice > this.maxPrice
    ) {
      throw new BadRequestException(
        'minPrice debe ser menor o igual que maxPrice',
      );
    }

    return {
      startDate,
      endDate,
      restaurantId: this.restaurantId,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
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
