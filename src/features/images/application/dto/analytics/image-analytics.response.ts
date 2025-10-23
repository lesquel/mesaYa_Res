export interface ImageAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface ImageAnalyticsSummary {
  readonly totalImages: number;
  readonly uniqueEntities: number;
  readonly averageImagesPerEntity: number;
  readonly imagesLast30Days: number;
}

export interface ImageAnalyticsResponse {
  readonly summary: ImageAnalyticsSummary;
  readonly uploads: {
    readonly total: number;
    readonly byDate: ImageAnalyticsTrendPoint[];
  };
  readonly entities: Array<{ readonly entityId: number; readonly count: number }>;
}

export interface ImageAnalyticsRepositoryTotals {
  readonly totalImages: number;
  readonly uniqueEntities: number;
}

export interface ImageAnalyticsRepositoryResult {
  readonly totals: ImageAnalyticsRepositoryTotals;
  readonly entityDistribution: Array<{ entityId: number; count: number }>;
  readonly uploadsByDate: ImageAnalyticsTrendPoint[];
}
