import { ApiProperty } from '@nestjs/swagger';
import type { SubscriptionAnalyticsResponse } from '@features/subscription/application';
import { SubscriptionPlanPeriodsEnum } from '@features/subscription/domain/enums';
import { SubscriptionStatesEnum } from '@features/subscription/domain/enums/subscription-states.enum';

class SubscriptionAnalyticsSummaryDto {
  @ApiProperty({ description: 'Total de suscripciones registradas' })
  totalSubscriptions!: number;

  @ApiProperty({ description: 'Suscripciones activas' })
  activeSubscriptions!: number;

  @ApiProperty({ description: 'Suscripciones inactivas' })
  inactiveSubscriptions!: number;

  @ApiProperty({ description: 'Ingresos totales asociados a las suscripciones' })
  totalRevenue!: number;

  @ApiProperty({ description: 'Ingreso promedio por suscripción' })
  averageRevenuePerSubscription!: number;

  @ApiProperty({ description: 'Restaurantes únicos con suscripciones' })
  uniqueRestaurants!: number;
}

class SubscriptionAnalyticsStateDistributionDto {
  @ApiProperty({ enum: SubscriptionStatesEnum })
  state!: SubscriptionStatesEnum;

  @ApiProperty({ description: 'Cantidad de suscripciones en el estado' })
  count!: number;
}

class SubscriptionAnalyticsPlanPerformanceDto {
  @ApiProperty({ description: 'Identificador del plan' })
  planId!: string;

  @ApiProperty({ description: 'Nombre del plan' })
  planName!: string;

  @ApiProperty({ description: 'Precio del plan' })
  price!: number;

  @ApiProperty({ description: 'Total de suscripciones asociadas' })
  subscriptions!: number;

  @ApiProperty({ description: 'Suscripciones activas asociadas' })
  activeSubscriptions!: number;

  @ApiProperty({ description: 'Ingresos generados por el plan' })
  revenue!: number;
}

class SubscriptionAnalyticsPeriodDistributionDto {
  @ApiProperty({ enum: SubscriptionPlanPeriodsEnum })
  period!: SubscriptionPlanPeriodsEnum;

  @ApiProperty({ description: 'Cantidad de suscripciones con el periodo' })
  count!: number;

  @ApiProperty({ description: 'Ingresos generados en el periodo' })
  revenue!: number;
}

class SubscriptionAnalyticsTrendPointDto {
  @ApiProperty({ description: 'Fecha (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ description: 'Suscripciones iniciadas en la fecha' })
  count!: number;

  @ApiProperty({ description: 'Ingresos generados en la fecha' })
  revenue!: number;
}

export class SubscriptionAnalyticsResponseDto {
  @ApiProperty({ type: SubscriptionAnalyticsSummaryDto })
  summary!: SubscriptionAnalyticsSummaryDto;

  @ApiProperty({ type: [SubscriptionAnalyticsStateDistributionDto] })
  stateDistribution!: SubscriptionAnalyticsStateDistributionDto[];

  @ApiProperty({ type: [SubscriptionAnalyticsPlanPerformanceDto] })
  planPerformance!: SubscriptionAnalyticsPlanPerformanceDto[];

  @ApiProperty({ type: [SubscriptionAnalyticsPeriodDistributionDto] })
  periodDistribution!: SubscriptionAnalyticsPeriodDistributionDto[];

  @ApiProperty({ type: [SubscriptionAnalyticsTrendPointDto] })
  activationTrend!: SubscriptionAnalyticsTrendPointDto[];

  static fromApplication(
    response: SubscriptionAnalyticsResponse,
  ): SubscriptionAnalyticsResponseDto {
    const dto = new SubscriptionAnalyticsResponseDto();
    dto.summary = {
      totalSubscriptions: response.summary.totalSubscriptions,
      activeSubscriptions: response.summary.activeSubscriptions,
      inactiveSubscriptions: response.summary.inactiveSubscriptions,
      totalRevenue: response.summary.totalRevenue,
      averageRevenuePerSubscription:
        response.summary.averageRevenuePerSubscription,
      uniqueRestaurants: response.summary.uniqueRestaurants,
    };
    dto.stateDistribution = response.stateDistribution.map((item) => ({
      state: item.state,
      count: item.count,
    }));
    dto.planPerformance = response.planPerformance.map((item) => ({
      planId: item.planId,
      planName: item.planName,
      price: item.price,
      subscriptions: item.subscriptions,
      activeSubscriptions: item.activeSubscriptions,
      revenue: item.revenue,
    }));
    dto.periodDistribution = response.periodDistribution.map((item) => ({
      period: item.period,
      count: item.count,
      revenue: item.revenue,
    }));
    dto.activationTrend = response.activationTrend.map((point) => ({
      date: point.date,
      count: point.count,
      revenue: point.revenue,
    }));
    return dto;
  }
}
