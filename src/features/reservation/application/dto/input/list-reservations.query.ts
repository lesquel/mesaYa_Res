import { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface ListReservationsQuery extends PaginatedQueryParams {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  restaurantId?: string;
  // date in YYYY-MM-DD format to filter reservations on that date
  date?: string;
}
