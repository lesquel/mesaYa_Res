import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import type { AuthAnalyticsQuery } from '../../application/dto/queries/auth-analytics.query.js';

export class AuthAnalyticsRequestDto {
  @ApiPropertyOptional({
    description: 'Fecha inicial del rango (ISO 8601)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango (ISO 8601)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Rol a filtrar',
    example: 'ADMIN',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @ApiPropertyOptional({
    description: 'UUID del restaurante para filtrar usuarios que tienen reservas en él',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'Estado del usuario (true/false)',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;

  toQuery(): AuthAnalyticsQuery {
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
      startDate,
      endDate,
      role: this.role,
      active:
        this.active !== undefined
          ? this.active.toLowerCase() === 'true'
          : undefined,
      restaurantId: this.restaurantId,
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
