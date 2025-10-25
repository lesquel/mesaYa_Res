import { ApiProperty } from '@nestjs/swagger';
import type { SubscriptionPlanAnalyticsResponse } from '@features/subscription/application';
import {
  SubscriptionPlanPeriodsEnum,
  SubscriptionPlanStatesEnum,
} from '@features/subscription/domain/enums';

class SubscriptionPlanAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de planes disponibles' })
  totalPlans!: number;

  @ApiProperty({ description: 'Planes activos' })
  activePlans!: number;

  @ApiProperty({ description: 'Planes inactivos' })
  inactivePlans!: number;

  @ApiProperty({ description: 'Precio promedio de los planes' })
  averagePrice!: number;

  @ApiProperty({ description: 'Precio mínimo registrado' })
  minPrice!: number;

  @ApiProperty({ description: 'Precio máximo registrado' })
  maxPrice!: number;
}

class SubscriptionPlanAnalyticsPriceBucketDto {
  @ApiProperty({ description: 'Rango de precio agrupado' })
  bucket!: string;

  @ApiProperty({ description: 'Cantidad de planes en el rango' })
  count!: number;
}

class SubscriptionPlanAnalyticsPeriodDistributionDto {
  @ApiProperty({ enum: SubscriptionPlanPeriodsEnum })
  period!: SubscriptionPlanPeriodsEnum;

  @ApiProperty({ description: 'Cantidad de planes con el periodo' })
  count!: number;
}

class SubscriptionPlanAnalyticsStateDistributionDto {
  @ApiProperty({ enum: SubscriptionPlanStatesEnum })
  state!: SubscriptionPlanStatesEnum;

  @ApiProperty({ description: 'Cantidad de planes en el estado' })
  count!: number;
}

class SubscriptionPlanAnalyticsUsageDto {
  @ApiProperty({ description: 'Identificador del plan' })
  planId!: string;

  @ApiProperty({ description: 'Nombre del plan' })
  planName!: string;

  @ApiProperty({ description: 'Precio del plan' })
  price!: number;

  @ApiProperty({ description: 'Suscripciones asociadas al plan' })
  subscriptions!: number;

  @ApiProperty({ description: 'Suscripciones activas del plan' })
  activeSubscriptions!: number;

  @ApiProperty({ description: 'Ingresos generados por el plan' })
  revenue!: number;
}

class SubscriptionPlanAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ description: 'Planes creados en la fecha' })
  count!: number;

  @ApiProperty({
    description: 'Precio promedio de los planes creados en la fecha',
  })
  averagePrice!: number;
}

export class SubscriptionPlanAnalyticsResponseDto {
  @ApiProperty({ type: SubscriptionPlanAnalyticsSummaryDto })
  summary!: SubscriptionPlanAnalyticsSummaryDto;

  @ApiProperty({ type: [SubscriptionPlanAnalyticsPriceBucketDto] })
  priceDistribution!: SubscriptionPlanAnalyticsPriceBucketDto[];

  @ApiProperty({ type: [SubscriptionPlanAnalyticsPeriodDistributionDto] })
  periodDistribution!: SubscriptionPlanAnalyticsPeriodDistributionDto[];

  @ApiProperty({ type: [SubscriptionPlanAnalyticsStateDistributionDto] })
  stateDistribution!: SubscriptionPlanAnalyticsStateDistributionDto[];

  @ApiProperty({ type: [SubscriptionPlanAnalyticsUsageDto] })
  subscriptionUsage!: SubscriptionPlanAnalyticsUsageDto[];

  @ApiProperty({ type: [SubscriptionPlanAnalyticsTrendPointDto] })
  creationTrend!: SubscriptionPlanAnalyticsTrendPointDto[];

  static fromApplication(
    response: SubscriptionPlanAnalyticsResponse,
  ): SubscriptionPlanAnalyticsResponseDto {
    const dto = new SubscriptionPlanAnalyticsResponseDto();
    dto.summary = {
      totalPlans: response.summary.totalPlans,
      activePlans: response.summary.activePlans,
      inactivePlans: response.summary.inactivePlans,
      averagePrice: response.summary.averagePrice,
      minPrice: response.summary.minPrice,
      maxPrice: response.summary.maxPrice,
    };
    dto.priceDistribution = response.priceDistribution.map((bucket) => ({
      bucket: bucket.bucket,
      count: bucket.count,
    }));
    dto.periodDistribution = response.periodDistribution.map((item) => ({
      period: item.period,
      count: item.count,
    }));
    dto.stateDistribution = response.stateDistribution.map((item) => ({
      state: item.state,
      count: item.count,
    }));
    dto.subscriptionUsage = response.subscriptionUsage.map((usage) => ({
      planId: usage.planId,
      planName: usage.planName,
      price: usage.price,
      subscriptions: usage.subscriptions,
      activeSubscriptions: usage.activeSubscriptions,
      revenue: usage.revenue,
    }));
    dto.creationTrend = response.creationTrend.map((point) => ({
      date: point.date,
      count: point.count,
      averagePrice: point.averagePrice,
    }));
    return dto;
  }
}
