export class ReservationNotFoundError extends Error {
  constructor(public readonly reservationId: string) {
    super(`Reservation ${reservationId} not found`);
    this.name = ReservationNotFoundError.name;
  }
}
