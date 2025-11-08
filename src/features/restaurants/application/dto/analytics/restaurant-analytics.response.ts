export interface RestaurantAnalyticsSummary {
  readonly totalRestaurants: number;
  readonly activeRestaurants: number;
  readonly inactiveRestaurants: number;
  readonly averageCapacity: number;
}

export interface RestaurantAnalyticsDistributionItem {
  readonly key: string | null;
  readonly count: number;
}

export interface RestaurantAnalyticsBucketDistribution {
  readonly bucket: string;
  readonly count: number;
}

export interface RestaurantAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface RestaurantAnalyticsResponse {
  readonly summary: RestaurantAnalyticsSummary;
  readonly capacityBuckets: RestaurantAnalyticsBucketDistribution[];
  readonly locationDistribution: RestaurantAnalyticsDistributionItem[];
  readonly ownerDistribution: RestaurantAnalyticsDistributionItem[];
  readonly subscriptionDistribution: RestaurantAnalyticsDistributionItem[];
  readonly creationTrend: RestaurantAnalyticsTrendPoint[];
}

export interface RestaurantAnalyticsRepositoryTotals
  extends RestaurantAnalyticsSummary {}

export interface RestaurantAnalyticsRepositoryResult {
  readonly totals: RestaurantAnalyticsRepositoryTotals;
  readonly capacityDistribution: RestaurantAnalyticsBucketDistribution[];
  readonly locationDistribution: RestaurantAnalyticsDistributionItem[];
  readonly ownerDistribution: RestaurantAnalyticsDistributionItem[];
  readonly subscriptionDistribution: RestaurantAnalyticsDistributionItem[];
  readonly creationTrend: RestaurantAnalyticsTrendPoint[];
}
