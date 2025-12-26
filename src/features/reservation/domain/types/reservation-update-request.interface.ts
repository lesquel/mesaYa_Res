export interface ReservationUpdateRequest {
  reservationId: string;
  userId: string;
  reservationDate?: Date;
  reservationTime?: Date;
  numberOfGuests?: number;
  durationMinutes?: number;
  enforceOwnership?: boolean;
}
