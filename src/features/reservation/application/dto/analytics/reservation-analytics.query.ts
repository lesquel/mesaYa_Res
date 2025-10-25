export interface ReservationAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly restaurantId?: string;
  readonly status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  readonly minGuests?: number;
  readonly maxGuests?: number;
}
