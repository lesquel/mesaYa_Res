export interface MenuAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
}

export interface MenuAnalyticsSummary {
  readonly totalMenus: number;
  readonly restaurantsWithMenus: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
}

export interface MenuAnalyticsResponse {
  readonly summary: MenuAnalyticsSummary;
  readonly menus: {
    readonly total: number;
    readonly byDate: MenuAnalyticsTrendPoint[];
  };
  readonly restaurants: Array<{
    readonly restaurantId: number;
    readonly count: number;
  }>;
  readonly priceRanges: Array<{
    readonly label: string;
    readonly count: number;
  }>;
}

export interface MenuAnalyticsRepositoryTotals {
  readonly totalMenus: number;
  readonly restaurantsWithMenus: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
}

export interface MenuAnalyticsRepositoryResult {
  readonly totals: MenuAnalyticsRepositoryTotals;
  readonly menusByRestaurant: Array<{ restaurantId: number; count: number }>;
  readonly menusByDate: MenuAnalyticsTrendPoint[];
  readonly priceDistribution: Array<{ bucket: string; count: number }>;
}
