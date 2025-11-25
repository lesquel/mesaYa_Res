import { PaginatedResult } from '@shared/application/types/pagination';
import type { ReservationStatus } from '../../../domain/types/reservation-status.type';

export interface ReservationResponseDto {
  id: string;
  restaurantId: string;
  userId: string;
  tableId: string;
  reservationDate: Date;
  reservationTime: Date;
  numberOfGuests: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
  /** Name of the user who made the reservation */
  userName?: string;
  /** Email of the user who made the reservation */
  userEmail?: string;
}

export type PaginatedReservationResponse =
  PaginatedResult<ReservationResponseDto>;
