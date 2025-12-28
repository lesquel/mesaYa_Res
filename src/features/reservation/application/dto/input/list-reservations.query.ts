import { PaginatedQueryParams } from '@shared/application/types';
import type { ReservationStatus } from '../../../domain/types/reservation-status.type';

export interface ListReservationsQuery extends PaginatedQueryParams {
  status?: ReservationStatus;
  restaurantId?: string;
  // date in YYYY-MM-DD format to filter reservations on that date
  date?: string;
}
