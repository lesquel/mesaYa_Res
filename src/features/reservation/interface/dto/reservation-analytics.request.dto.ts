import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import type { ReservationAnalyticsQuery } from '../../application/dto/analytics/reservation-analytics.query';
import {
  ReservationStatus,
  RESERVATION_STATUSES,
} from '../../domain/types/reservation-status.type';

export class ReservationAnalyticsRequestDto {
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
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'Estado de la reserva',
    enum: RESERVATION_STATUSES,
  })
  @IsOptional()
  @IsIn(RESERVATION_STATUSES)
  status?: ReservationStatus;

  @ApiPropertyOptional({ description: 'Cantidad mínima de invitados' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minGuests?: number;

  @ApiPropertyOptional({ description: 'Cantidad máxima de invitados' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGuests?: number;

  toQuery(): ReservationAnalyticsQuery {
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
      typeof this.minGuests === 'number' &&
      typeof this.maxGuests === 'number' &&
      this.minGuests > this.maxGuests
    ) {
      throw new BadRequestException(
        'minGuests debe ser menor o igual que maxGuests',
      );
    }

    return {
      startDate,
      endDate,
      restaurantId: this.restaurantId,
      status: this.status,
      minGuests: this.minGuests,
      maxGuests: this.maxGuests,
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
