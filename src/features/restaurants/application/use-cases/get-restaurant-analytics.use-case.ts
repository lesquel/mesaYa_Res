import { Inject } from '@nestjs/common';
import type { RestaurantAnalyticsQuery } from '../dto/analytics/restaurant-analytics.query.js';
import {
  type RestaurantAnalyticsResponse,
  type RestaurantAnalyticsRepositoryResult,
  RESTAURANT_ANALYTICS_REPOSITORY,
  type RestaurantAnalyticsRepositoryPort,
} from '../index.js';

export class GetRestaurantAnalyticsUseCase {
  constructor(
    @Inject(RESTAURANT_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: RestaurantAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: RestaurantAnalyticsQuery,
  ): Promise<RestaurantAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalRestaurants: analytics.totals.totalRestaurants,
        activeRestaurants: analytics.totals.activeRestaurants,
        inactiveRestaurants: analytics.totals.inactiveRestaurants,
        averageCapacity: this.toRounded(analytics.totals.averageCapacity),
      },
      capacityBuckets: analytics.capacityDistribution.map((bucket) => ({
        bucket: bucket.bucket,
        count: bucket.count,
      })),
      locationDistribution: analytics.locationDistribution.map((item) => ({
        key: item.key ?? 'UNKNOWN',
        count: item.count,
      })),
      ownerDistribution: analytics.ownerDistribution.map((item) => ({
        key: item.key,
        count: item.count,
      })),
      subscriptionDistribution: analytics.subscriptionDistribution.map(
        (item) => ({
          key: item.key,
          count: item.count,
        }),
      ),
      creationTrend: analytics.creationTrend.map((point) => ({
        date: point.date,
        count: point.count,
      })),
    };
  }

  private toRounded(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
