import { Booking } from '../../domain/entities/booking.entity.js';
import { ListBookingsQuery, ListRestaurantBookingsQuery } from '../dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface BookingRepositoryPort {
  save(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListBookingsQuery): Promise<PaginatedResult<Booking>>;
  paginateByRestaurant(
    query: ListRestaurantBookingsQuery,
  ): Promise<PaginatedResult<Booking>>;
}
