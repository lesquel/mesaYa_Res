import { ReservationEntity } from '../../domain/entities/reservation.entity.js';
import {
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
} from '../dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface ReservationRepositoryPort {
  save(reservation: ReservationEntity): Promise<ReservationEntity>;
  findById(id: string): Promise<ReservationEntity | null>;
  delete(id: string): Promise<void>;
  paginate(
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>>;
  paginateByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>>;
}
