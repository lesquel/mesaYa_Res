import { Inject } from '@nestjs/common';
import type { SectionAnalyticsQuery } from '../dto/analytics/section-analytics.query';
import type {
  SectionAnalyticsResponse,
  SectionAnalyticsRepositoryResult,
} from '../dto/analytics/section-analytics.response';
import {
  SECTION_ANALYTICS_REPOSITORY,
  type SectionAnalyticsRepositoryPort,
} from '../ports/section-analytics.repository.port';

export class GetSectionAnalyticsUseCase {
  constructor(
    @Inject(SECTION_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: SectionAnalyticsRepositoryPort,
  ) {}

  async execute(
    query: SectionAnalyticsQuery,
  ): Promise<SectionAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalSections: analytics.totals.totalSections,
        averageWidth: this.toRounded(analytics.totals.averageWidth),
        averageHeight: this.toRounded(analytics.totals.averageHeight),
        averageArea: this.toRounded(analytics.totals.averageArea),
      },
      areaBuckets: analytics.areaDistribution.map((bucket) => ({
        bucket: bucket.bucket,
        count: bucket.count,
      })),
      restaurantDistribution: analytics.restaurantDistribution.map((item) => ({
        restaurantId: item.restaurantId,
        count: item.count,
      })),
      dimensionExtremes: {
        minWidth: analytics.dimensionExtremes.minWidth,
        maxWidth: analytics.dimensionExtremes.maxWidth,
        minHeight: analytics.dimensionExtremes.minHeight,
        maxHeight: analytics.dimensionExtremes.maxHeight,
      },
    };
  }

  private toRounded(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
