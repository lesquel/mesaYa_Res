export interface RestaurantAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly active?: boolean;
  readonly ownerId?: string;
  readonly subscriptionId?: string;
}
