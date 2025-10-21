import { PaginatedResult } from '@shared/application/types/pagination';

export interface ReservationResponseDto {
  id: string;
  restaurantId: string;
  userId: string;
  tableId: string;
  reservationDate: Date;
  reservationTime: Date;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedReservationResponse =
  PaginatedResult<ReservationResponseDto>;
