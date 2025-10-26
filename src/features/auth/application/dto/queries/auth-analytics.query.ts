export interface AuthAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly role?: string;
  readonly active?: boolean;
  /** Optional filter to scope analytics to users that have reservations in a restaurant */
  readonly restaurantId?: string;
}
