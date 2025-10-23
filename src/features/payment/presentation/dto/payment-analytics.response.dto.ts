import { ApiProperty } from '@nestjs/swagger';
import type { PaymentAnalyticsResponse } from '../../application/dtos/analytics/payment-analytics.response';
import { PaymentStatusEnum, PaymentTypeEnum } from '../../domain/enums';

class PaymentAnalyticsSummaryDto {
  @ApiProperty()
  totalPayments!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  averageAmount!: number;

  @ApiProperty()
  completedPayments!: number;

  @ApiProperty()
  pendingPayments!: number;

  @ApiProperty()
  cancelledPayments!: number;

  @ApiProperty({ description: 'Porcentaje de pagos completados' })
  completionRate!: number;

  @ApiProperty()
  minAmount!: number;

  @ApiProperty()
  maxAmount!: number;
}

class PaymentAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha en formato YYYY-MM-DD' })
  date!: string;

  @ApiProperty({ description: 'Cantidad de pagos en la fecha' })
  count!: number;

  @ApiProperty({ description: 'Monto total recibido en la fecha' })
  amount!: number;
}

class PaymentAnalyticsRevenueDto {
  @ApiProperty({ description: 'Monto total recibido en el período' })
  totalAmount!: number;

  @ApiProperty({ description: 'Pagos totales en el período' })
  totalPayments!: number;

  @ApiProperty({ type: [PaymentAnalyticsTrendPointDto] })
  byDate!: PaymentAnalyticsTrendPointDto[];
}

class PaymentAnalyticsStatusItemDto {
  @ApiProperty({ enum: PaymentStatusEnum })
  status!: PaymentStatusEnum;

  @ApiProperty()
  count!: number;
}

class PaymentAnalyticsTypeItemDto {
  @ApiProperty({ enum: PaymentTypeEnum })
  type!: PaymentTypeEnum;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  amount!: number;
}

class PaymentAnalyticsRestaurantItemDto {
  @ApiProperty({ description: 'Identificador del restaurante' })
  restaurantId!: string;

  @ApiProperty({ description: 'Cantidad de pagos asociados' })
  count!: number;

  @ApiProperty({ description: 'Monto total asociado' })
  amount!: number;
}

export class PaymentAnalyticsResponseDto {
  @ApiProperty({ type: PaymentAnalyticsSummaryDto })
  summary!: PaymentAnalyticsSummaryDto;

  @ApiProperty({ type: PaymentAnalyticsRevenueDto })
  revenue!: PaymentAnalyticsRevenueDto;

  @ApiProperty({ type: [PaymentAnalyticsStatusItemDto] })
  statuses!: PaymentAnalyticsStatusItemDto[];

  @ApiProperty({ type: [PaymentAnalyticsTypeItemDto] })
  types!: PaymentAnalyticsTypeItemDto[];

  @ApiProperty({ type: [PaymentAnalyticsRestaurantItemDto] })
  topRestaurants!: PaymentAnalyticsRestaurantItemDto[];

  static fromApplication(
    response: PaymentAnalyticsResponse,
  ): PaymentAnalyticsResponseDto {
    const dto = new PaymentAnalyticsResponseDto();
    dto.summary = {
      totalPayments: response.summary.totalPayments,
      totalAmount: response.summary.totalAmount,
      averageAmount: response.summary.averageAmount,
      completedPayments: response.summary.completedPayments,
      pendingPayments: response.summary.pendingPayments,
      cancelledPayments: response.summary.cancelledPayments,
      completionRate: response.summary.completionRate,
      minAmount: response.summary.minAmount,
      maxAmount: response.summary.maxAmount,
    };
    dto.revenue = {
      totalAmount: response.revenue.totalAmount,
      totalPayments: response.revenue.totalPayments,
      byDate: response.revenue.byDate.map((point) => ({
        date: point.date,
        count: point.count,
        amount: point.amount,
      })),
    };
    dto.statuses = response.statuses.map((item) => ({
      status: item.status,
      count: item.count,
    }));
    dto.types = response.types.map((item) => ({
      type: item.type,
      count: item.count,
      amount: item.amount,
    }));
    dto.topRestaurants = response.topRestaurants.map((item) => ({
      restaurantId: item.restaurantId,
      count: item.count,
      amount: item.amount,
    }));
    return dto;
  }
}
