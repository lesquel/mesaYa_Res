export interface ReservationCancellationRequest {
  reservationId: string;
  userId: string;
  enforceOwnership?: boolean;
}
