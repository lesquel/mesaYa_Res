import { BadRequestException } from '@nestjs/common';
import { parseAnalyticsDate } from '@shared/application/utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
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

  @ApiPropertyOptional({
    description: 'Identificador del restaurante',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  restaurantId?: string;

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
      ? parseAnalyticsDate(this.startDate, false, 'startDate')
      : undefined;
    const endDate = this.endDate
      ? parseAnalyticsDate(this.endDate, true, 'endDate')
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
}
