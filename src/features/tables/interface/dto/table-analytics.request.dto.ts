import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import type { TableAnalyticsQuery } from '../../application/dto/analytics/table-analytics.query';

export class TableAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Filtrar por sección', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por restaurante',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  toQuery(): TableAnalyticsQuery {
    return {
      sectionId: this.sectionId,
      restaurantId: this.restaurantId,
    };
  }
}
