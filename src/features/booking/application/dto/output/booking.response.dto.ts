import { PaginatedResult } from '@shared/application/types/pagination.js';

export interface BookingResponseDto {
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

export type PaginatedBookingResponse = PaginatedResult<BookingResponseDto>;
