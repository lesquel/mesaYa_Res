export interface MenuAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly restaurantId?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}
