import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import type { SectionAnalyticsQuery } from '../../application/dto/analytics/section-analytics.query';

export class SectionAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Filtrar por restaurante', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  toQuery(): SectionAnalyticsQuery {
    return {
      restaurantId: this.restaurantId,
    };
  }
}
