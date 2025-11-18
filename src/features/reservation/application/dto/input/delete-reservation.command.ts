export interface DeleteReservationCommand {
  reservationId: string;
  userId: string;
  enforceOwnership?: boolean;
}
