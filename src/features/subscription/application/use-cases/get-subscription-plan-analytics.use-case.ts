import { Inject } from '@nestjs/common';
import type { SubscriptionPlanAnalyticsQuery } from '../dtos/analytics/subscription-plan-analytics.query';
import type { SubscriptionPlanAnalyticsResponse } from '../dtos/analytics/subscription-plan-analytics.response';
import {
  SUBSCRIPTION_PLAN_ANALYTICS_REPOSITORY,
  type SubscriptionPlanAnalyticsRepositoryPort,
} from '../ports/subscription-plan-analytics.repository.port';

export class GetSubscriptionPlanAnalyticsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_PLAN_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: SubscriptionPlanAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: SubscriptionPlanAnalyticsQuery,
  ): Promise<SubscriptionPlanAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalPlans: analytics.totals.totalPlans,
        activePlans: analytics.totals.activePlans,
        inactivePlans: analytics.totals.inactivePlans,
        averagePrice: this.toCurrency(analytics.totals.averagePrice),
        minPrice: this.toCurrency(analytics.totals.minPrice),
        maxPrice: this.toCurrency(analytics.totals.maxPrice),
      },
      priceDistribution: analytics.priceDistribution.map((bucket) => ({
        bucket: bucket.bucket,
        count: bucket.count,
      })),
      periodDistribution: analytics.periodDistribution.map((item) => ({
        period: item.period,
        count: item.count,
      })),
      stateDistribution: analytics.stateDistribution.map((item) => ({
        state: item.state,
        count: item.count,
      })),
      subscriptionUsage: analytics.subscriptionUsage.map((usage) => ({
        planId: usage.planId,
        planName: usage.planName,
        price: this.toCurrency(usage.price),
        subscriptions: usage.subscriptions,
        activeSubscriptions: usage.activeSubscriptions,
        revenue: this.toCurrency(usage.revenue),
      })),
      creationTrend: analytics.creationTrend.map((point) => ({
        date: point.date,
        count: point.count,
        averagePrice: this.toCurrency(point.averagePrice),
      })),
    };
  }

  private toCurrency(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
