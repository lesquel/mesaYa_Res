import type { ReservationResponseDto } from './reservation.response.dto';

export interface DeleteReservationResponseDto {
  ok: boolean;
  reservation: ReservationResponseDto;
}
