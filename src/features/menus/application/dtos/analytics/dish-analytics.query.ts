export interface DishAnalyticsQuery {
  readonly restaurantId?: string;
  readonly menuId?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
}
