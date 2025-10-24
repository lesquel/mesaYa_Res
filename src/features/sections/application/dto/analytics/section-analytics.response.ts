export interface SectionAnalyticsSummary {
  readonly totalSections: number;
  readonly averageWidth: number;
  readonly averageHeight: number;
  readonly averageArea: number;
}

export interface SectionAnalyticsAreaBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface SectionAnalyticsDistributionItem {
  readonly restaurantId: string;
  readonly count: number;
}

export interface SectionAnalyticsDimensionExtremes {
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
}

export interface SectionAnalyticsResponse {
  readonly summary: SectionAnalyticsSummary;
  readonly areaBuckets: SectionAnalyticsAreaBucket[];
  readonly restaurantDistribution: SectionAnalyticsDistributionItem[];
  readonly dimensionExtremes: SectionAnalyticsDimensionExtremes;
}

export interface SectionAnalyticsRepositoryTotals {
  readonly totalSections: number;
  readonly averageWidth: number;
  readonly averageHeight: number;
  readonly averageArea: number;
}

export interface SectionAnalyticsRepositoryResult {
  readonly totals: SectionAnalyticsRepositoryTotals;
  readonly areaDistribution: SectionAnalyticsAreaBucket[];
  readonly restaurantDistribution: SectionAnalyticsDistributionItem[];
  readonly dimensionExtremes: SectionAnalyticsDimensionExtremes;
}
