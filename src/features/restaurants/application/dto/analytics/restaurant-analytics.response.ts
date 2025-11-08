export interface RestaurantAnalyticsSummary {
  readonly totalRestaurants: number;
  readonly activeRestaurants: number;
  readonly inactiveRestaurants: number;
  readonly averageCapacity: number;
}

export interface RestaurantAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface RestaurantAnalyticsDistributionItem<
  K extends string | number | null = string,
> {
  readonly key: K;
  readonly count: number;
}

export interface RestaurantAnalyticsCapacityBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface RestaurantAnalyticsResponse {
  readonly summary: RestaurantAnalyticsSummary;
  readonly capacityBuckets: RestaurantAnalyticsCapacityBucket[];
  readonly locationDistribution: RestaurantAnalyticsDistributionItem[];
  readonly ownerDistribution: RestaurantAnalyticsDistributionItem<
    string | null
  >[];
  readonly subscriptionDistribution: RestaurantAnalyticsDistributionItem<string>[];
  readonly creationTrend: RestaurantAnalyticsTrendPoint[];
}

export interface RestaurantAnalyticsRepositoryTotals {
  readonly totalRestaurants: number;
  readonly activeRestaurants: number;
  readonly inactiveRestaurants: number;
  readonly averageCapacity: number;
}

export interface RestaurantAnalyticsRepositoryCapacityBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface RestaurantAnalyticsRepositoryDistribution<
  K extends string | number | null = string,
> {
  readonly key: K;
  readonly count: number;
}

export interface RestaurantAnalyticsRepositoryResult {
  readonly totals: RestaurantAnalyticsRepositoryTotals;
  readonly capacityDistribution: RestaurantAnalyticsRepositoryCapacityBucket[];
  readonly locationDistribution: RestaurantAnalyticsRepositoryDistribution[];
  readonly ownerDistribution: RestaurantAnalyticsRepositoryDistribution<
    string | null
  >[];
  readonly subscriptionDistribution: RestaurantAnalyticsRepositoryDistribution<string>[];
  readonly creationTrend: RestaurantAnalyticsTrendPoint[];
}
