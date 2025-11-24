import { PaginatedResult } from '@shared/application/types/pagination';
import { ReservationStatus } from '../../domain/types/reservation-status.type';

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
}

export type PaginatedReservationResponse =
  PaginatedResult<ReservationResponseDto>;
