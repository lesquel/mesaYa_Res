import { Inject } from '@nestjs/common';
import type { ReviewAnalyticsQuery } from '../dto/analytics/review-analytics.query';
import type { ReviewAnalyticsResponse } from '../dto/analytics/review-analytics.response';
import {
  REVIEW_ANALYTICS_REPOSITORY,
  type ReviewAnalyticsRepositoryPort,
} from '../ports/review-analytics.repository.port';

export class GetReviewAnalyticsUseCase {
  constructor(
    @Inject(REVIEW_ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: ReviewAnalyticsRepositoryPort,
  ) {}

  async execute(query: ReviewAnalyticsQuery): Promise<ReviewAnalyticsResponse> {
    const analytics = await this.analyticsRepository.compute(query);

    return {
      summary: {
        totalReviews: analytics.totals.totalReviews,
        averageRating: this.toRounded(analytics.totals.averageRating),
        positiveReviews: analytics.totals.positiveReviews,
        neutralReviews: analytics.totals.neutralReviews,
        negativeReviews: analytics.totals.negativeReviews,
      },
      ratingDistribution: analytics.ratingDistribution.map((item) => ({
        key: item.key,
        count: item.count,
      })),
      restaurantDistribution: analytics.restaurantDistribution.map((item) => ({
        key: item.key,
        count: item.count,
      })),
      trend: analytics.trend.map((point) => ({
        date: point.date,
        count: point.count,
        averageRating: this.toRounded(point.averageRating),
      })),
    };
  }

  private toRounded(value: number): number {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }
}
