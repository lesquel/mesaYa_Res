import type { ReservationResponseDto } from './reservation.response.dto.js';

export interface DeleteReservationResponseDto {
  ok: boolean;
  reservation: ReservationResponseDto;
}
