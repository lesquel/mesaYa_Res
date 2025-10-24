export interface DishAnalyticsSummary {
  readonly totalDishes: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly menusWithDishes: number;
}

export interface DishAnalyticsPriceBucket {
  readonly bucket: string;
  readonly count: number;
}

export interface DishAnalyticsRestaurantDistribution {
  readonly restaurantId: number;
  readonly count: number;
}

export interface DishAnalyticsTopDish {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly restaurantId: number;
}

export interface DishAnalyticsTrendPoint {
  readonly date: string;
  readonly count: number;
  readonly averagePrice: number;
}

export interface DishAnalyticsResponse {
  readonly summary: DishAnalyticsSummary;
  readonly priceDistribution: DishAnalyticsPriceBucket[];
  readonly restaurantDistribution: DishAnalyticsRestaurantDistribution[];
  readonly topDishes: DishAnalyticsTopDish[];
  readonly creationTrend: DishAnalyticsTrendPoint[];
}

export interface DishAnalyticsRepositoryTotals {
  readonly totalDishes: number;
  readonly averagePrice: number;
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly menusWithDishes: number;
}

export interface DishAnalyticsRepositoryResult {
  readonly totals: DishAnalyticsRepositoryTotals;
  readonly priceDistribution: DishAnalyticsPriceBucket[];
  readonly restaurantDistribution: DishAnalyticsRestaurantDistribution[];
  readonly topDishes: DishAnalyticsTopDish[];
  readonly creationTrend: DishAnalyticsTrendPoint[];
}
