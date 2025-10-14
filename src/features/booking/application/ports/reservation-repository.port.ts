import { Reservation } from '../../domain/entities/reservation.entity.js';
import {
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
} from '../dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface ReservationRepositoryPort {
  save(booking: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListReservationsQuery): Promise<PaginatedResult<Reservation>>;
  paginateByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedResult<Reservation>>;
}
