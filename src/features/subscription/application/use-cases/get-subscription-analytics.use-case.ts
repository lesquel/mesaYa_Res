import { Inject } from '@nestjs/common';
import { toRounded } from '@shared/application/utils';
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
        totalRevenue: toRounded(analytics.totals.totalRevenue),
        averageRevenuePerSubscription: toRounded(averageRevenue),
        uniqueRestaurants: analytics.totals.uniqueRestaurants,
      },
      stateDistribution: analytics.stateDistribution.map((item) => ({
        state: item.state,
        count: item.count,
      })),
      planPerformance: analytics.planPerformance.map((item) => ({
        planId: item.planId,
        planName: item.planName,
        price: toRounded(item.price),
        subscriptions: item.subscriptions,
        activeSubscriptions: item.activeSubscriptions,
        revenue: toRounded(item.revenue),
      })),
      periodDistribution: analytics.periodDistribution.map((item) => ({
        period: item.period,
        count: item.count,
        revenue: toRounded(item.revenue),
      })),
      activationTrend: analytics.activationTrend.map((point) => ({
        date: point.date,
        count: point.count,
        revenue: toRounded(point.revenue),
      })),
    };
  }
}
