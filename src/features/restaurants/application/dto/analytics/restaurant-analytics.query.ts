export interface RestaurantAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly ownerId?: string;
  readonly subscriptionId?: string;
  readonly location?: string;
}
