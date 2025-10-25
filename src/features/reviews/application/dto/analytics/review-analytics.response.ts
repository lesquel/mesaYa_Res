export interface ReviewAnalyticsSummary {
  readonly totalReviews: number;
  readonly averageRating: number;
  readonly positiveReviews: number;
  readonly neutralReviews: number;
  readonly negativeReviews: number;
}

export interface ReviewAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly averageRating: number;
}

export interface ReviewAnalyticsDistributionItem {
  readonly key: string;
  readonly count: number;
}

export interface ReviewAnalyticsResponse {
  readonly summary: ReviewAnalyticsSummary;
  readonly ratingDistribution: ReviewAnalyticsDistributionItem[];
  readonly restaurantDistribution: ReviewAnalyticsDistributionItem[];
  readonly trend: ReviewAnalyticsTrendPoint[];
}

export interface ReviewAnalyticsRepositoryTotals {
  readonly totalReviews: number;
  readonly averageRating: number;
  readonly positiveReviews: number;
  readonly neutralReviews: number;
  readonly negativeReviews: number;
}

export interface ReviewAnalyticsRepositoryResult {
  readonly totals: ReviewAnalyticsRepositoryTotals;
  readonly ratingDistribution: ReviewAnalyticsDistributionItem[];
  readonly restaurantDistribution: ReviewAnalyticsDistributionItem[];
  readonly trend: ReviewAnalyticsTrendPoint[];
}
