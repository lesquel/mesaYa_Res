import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
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

  @ApiPropertyOptional({ description: 'Identificador de la imagen asociada' })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageId?: number;

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

  private assertRange(
    minLabel: string,
    maxLabel: string,
    minValue?: number,
    maxValue?: number,
  ): void {
    if (typeof minValue === 'number' && typeof maxValue === 'number') {
      if (minValue > maxValue) {
        throw new BadRequestException(`${minLabel} debe ser menor o igual que ${maxLabel}`);
      }
    }
  }
}
