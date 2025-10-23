export interface GraphicObjectAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface GraphicObjectAnalyticsSummary {
  readonly totalObjects: number;
  readonly uniqueImages: number;
  readonly averageWidth: number;
  readonly averageHeight: number;
  readonly averageArea: number;
  readonly averagePositionX: number;
  readonly averagePositionY: number;
  readonly objectsLast30Days: number;
}

export interface GraphicObjectAnalyticsResponse {
  readonly summary: GraphicObjectAnalyticsSummary;
  readonly objects: {
    readonly total: number;
    readonly byDate: GraphicObjectAnalyticsTrendPoint[];
  };
  readonly images: Array<{
    readonly imageId: number;
    readonly count: number;
  }>;
  readonly sizeBuckets: Array<{
    readonly bucket: string;
    readonly count: number;
  }>;
  readonly orientations: Array<{
    readonly orientation: string;
    readonly count: number;
  }>;
}

export interface GraphicObjectAnalyticsRepositoryTotals {
  readonly totalObjects: number;
  readonly uniqueImages: number;
  readonly averageWidth: number;
  readonly averageHeight: number;
  readonly averageArea: number;
  readonly averagePositionX: number;
  readonly averagePositionY: number;
}

export interface GraphicObjectAnalyticsRepositoryResult {
  readonly totals: GraphicObjectAnalyticsRepositoryTotals;
  readonly objectsByDate: GraphicObjectAnalyticsTrendPoint[];
  readonly objectsByImage: Array<{ imageId: number; count: number }>;
  readonly sizeDistribution: Array<{ bucket: string; count: number }>;
  readonly orientationDistribution: Array<{
    orientation: string;
    count: number;
  }>;
}
