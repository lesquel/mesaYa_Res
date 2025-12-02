import { BadRequestException } from '@nestjs/common';
import { parseAnalyticsDate } from '@shared/application/utils';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import type { GraphicObjectAnalyticsQuery } from '../../application/dto/analytics/graphic-object-analytics.query';

export class GraphicObjectAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Identificador de la imagen asociada',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  imageId?: string;

  @ApiPropertyOptional({ description: 'Ancho mínimo (px)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minWidth?: number;

  @ApiPropertyOptional({ description: 'Ancho máximo (px)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWidth?: number;

  @ApiPropertyOptional({ description: 'Alto mínimo (px)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minHeight?: number;

  @ApiPropertyOptional({ description: 'Alto máximo (px)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxHeight?: number;

  toQuery(): GraphicObjectAnalyticsQuery {
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

    this.assertRange('minWidth', 'maxWidth', this.minWidth, this.maxWidth);
    this.assertRange('minHeight', 'maxHeight', this.minHeight, this.maxHeight);

    return {
      startDate,
      endDate,
      imageId: this.imageId,
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
    };
  }

  private assertRange(
    minLabel: string,
    maxLabel: string,
    minValue?: number,
    maxValue?: number,
  ): void {
    if (typeof minValue === 'number' && typeof maxValue === 'number') {
      if (minValue > maxValue) {
        throw new BadRequestException(
          `${minLabel} debe ser menor o igual que ${maxLabel}`,
        );
      }
    }
  }
}
