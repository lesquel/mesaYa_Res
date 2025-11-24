import { ReservationStatus } from '../../../domain/types/reservation-status.type';

export interface ReservationAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly restaurantId?: string;
  readonly status?: ReservationStatus;
  readonly minGuests?: number;
  readonly maxGuests?: number;
}
