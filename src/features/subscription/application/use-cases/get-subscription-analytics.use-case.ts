import { Inject } from '@nestjs/common';
import type { SubscriptionAnalyticsQuery } from '../dtos/analytics/subscription-analytics.query';
import type { SubscriptionAnalyticsResponse } from '../dtos/analytics/subscription-analytics.response';
import {
  SUBSCRIPTION_ANALYTICS_REPOSITORY,
  type SubscriptionAnalyticsRepositoryPort,
} from '../ports/subscription-analytics.repository.port';

export class GetSubscriptionAnalyticsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: SubscriptionAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: SubscriptionAnalyticsQuery,
  ): Promise<SubscriptionAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    const averageRevenue =
      analytics.totals.totalSubscriptions > 0
        ? analytics.totals.totalRevenue / analytics.totals.totalSubscriptions
        : 0;

    return {
      summary: {
        totalSubscriptions: analytics.totals.totalSubscriptions,
        activeSubscriptions: analytics.totals.activeSubscriptions,
        inactiveSubscriptions: analytics.totals.inactiveSubscriptions,
        totalRevenue: this.toCurrency(analytics.totals.totalRevenue),
        averageRevenuePerSubscription: this.toCurrency(averageRevenue),
        uniqueRestaurants: analytics.totals.uniqueRestaurants,
      },
      stateDistribution: analytics.stateDistribution.map((item) => ({
        state: item.state,
        count: item.count,
      })),
      planPerformance: analytics.planPerformance.map((item) => ({
        planId: item.planId,
        planName: item.planName,
        price: this.toCurrency(item.price),
        subscriptions: item.subscriptions,
        activeSubscriptions: item.activeSubscriptions,
        revenue: this.toCurrency(item.revenue),
      })),
      periodDistribution: analytics.periodDistribution.map((item) => ({
        period: item.period,
        count: item.count,
        revenue: this.toCurrency(item.revenue),
      })),
      activationTrend: analytics.activationTrend.map((point) => ({
        date: point.date,
        count: point.count,
        revenue: this.toCurrency(point.revenue),
      })),
    };
  }

  private toCurrency(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
