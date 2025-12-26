import type { ReservationStatus } from './reservation-status.type';

export interface ReservationStatusChangeRequest {
  reservationId: string;
  status: ReservationStatus;
}
