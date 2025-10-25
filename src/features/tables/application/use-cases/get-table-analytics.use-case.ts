import { Inject } from '@nestjs/common';
import type { TableAnalyticsQuery } from '../dto/analytics/table-analytics.query';
import type { TableAnalyticsResponse } from '../dto/analytics/table-analytics.response';
import {
  TABLE_ANALYTICS_REPOSITORY,
  type TableAnalyticsRepositoryPort,
} from '../ports/table-analytics.repository.port';

export class GetTableAnalyticsUseCase {
  constructor(
    @Inject(TABLE_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: TableAnalyticsRepositoryPort,
  ) {}

  async execute(query: TableAnalyticsQuery): Promise<TableAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalTables: analytics.totals.totalTables,
        averageCapacity: this.toRounded(analytics.totals.averageCapacity),
        minCapacity: analytics.totals.minCapacity,
        maxCapacity: analytics.totals.maxCapacity,
      },
      capacityBuckets: analytics.capacityDistribution.map((bucket) => ({
        bucket: bucket.bucket,
        count: bucket.count,
      })),
      sectionDistribution: analytics.sectionDistribution.map((item) => ({
        id: item.id,
        count: item.count,
      })),
      restaurantDistribution: analytics.restaurantDistribution.map((item) => ({
        id: item.id,
        count: item.count,
      })),
    };
  }

  private toRounded(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
