import type { ReviewAnalyticsQuery } from '../dto/analytics/review-analytics.query';
import type { ReviewAnalyticsRepositoryResult } from '../dto/analytics/review-analytics.response';

export const REVIEW_ANALYTICS_REPOSITORY = Symbol(
  'REVIEW_ANALYTICS_REPOSITORY',
);

export interface ReviewAnalyticsRepositoryPort {
  compute(
    query: ReviewAnalyticsQuery,
  ): Promise<ReviewAnalyticsRepositoryResult>;
}
