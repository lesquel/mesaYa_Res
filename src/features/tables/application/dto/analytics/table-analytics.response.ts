export interface TableAnalyticsSummary {
  readonly totalTables: number;
  readonly averageCapacity: number;
  readonly minCapacity: number;
  readonly maxCapacity: number;
}

export interface TableAnalyticsCapacityBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface TableAnalyticsDistributionItem {
  readonly id: string;
  readonly count: number;
}

export interface TableAnalyticsResponse {
  readonly summary: TableAnalyticsSummary;
  readonly capacityBuckets: TableAnalyticsCapacityBucket[];
  readonly sectionDistribution: TableAnalyticsDistributionItem[];
  readonly restaurantDistribution: TableAnalyticsDistributionItem[];
}

export interface TableAnalyticsRepositoryTotals {
  readonly totalTables: number;
  readonly averageCapacity: number;
  readonly minCapacity: number;
  readonly maxCapacity: number;
}

export interface TableAnalyticsRepositoryResult {
  readonly totals: TableAnalyticsRepositoryTotals;
  readonly capacityDistribution: TableAnalyticsCapacityBucket[];
  readonly sectionDistribution: TableAnalyticsDistributionItem[];
  readonly restaurantDistribution: TableAnalyticsDistributionItem[];
}
