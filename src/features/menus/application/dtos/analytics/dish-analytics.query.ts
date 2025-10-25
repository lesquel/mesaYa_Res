export interface DishAnalyticsQuery {
  readonly restaurantId?: number;
  readonly menuId?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
}
