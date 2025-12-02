import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import type { ReviewAnalyticsQuery } from '../../application/dto/analytics/review-analytics.query';
import { parseAnalyticsDate } from '@shared/application/utils';

export class ReviewAnalyticsRequestDto {
  @ApiPropertyOptional({
    description: 'Filtrar por restaurante',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  toQuery(): ReviewAnalyticsQuery {
    const startDate = this.startDate
      ? parseAnalyticsDate(this.startDate, false, 'startDate')
      : undefined;
    const endDate = this.endDate
      ? parseAnalyticsDate(this.endDate, true, 'endDate')
      : undefined;

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'startDate debe ser menor o igual que endDate.',
      );
    }

    return {
      restaurantId: this.restaurantId,
      startDate,
      endDate,
    };
  }
}
