export interface MenuAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly restaurantId?: number;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}
