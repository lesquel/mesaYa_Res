import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import type { PaymentAnalyticsQuery } from '../../application/dtos/analytics/payment-analytics.query';
import { PaymentStatusEnum, PaymentTypeEnum } from '../../domain/enums';

export class PaymentAnalyticsRequestDto {
  @ApiPropertyOptional({ description: 'Fecha inicial (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha final (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del pago',
    enum: PaymentStatusEnum,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de pago',
    enum: PaymentTypeEnum,
  })
  @IsOptional()
  @IsEnum(PaymentTypeEnum)
  type?: PaymentTypeEnum;

  @ApiPropertyOptional({ description: 'Filtrar por restaurante', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Monto mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Monto máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  toQuery(): PaymentAnalyticsQuery {
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
      typeof this.minAmount === 'number' &&
      typeof this.maxAmount === 'number' &&
      this.minAmount > this.maxAmount
    ) {
      throw new BadRequestException(
        'minAmount debe ser menor o igual que maxAmount',
      );
    }

    return {
      startDate,
      endDate,
      status: this.status,
      type: this.type,
      restaurantId: this.restaurantId,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
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
