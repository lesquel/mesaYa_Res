export class InvalidReservationDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InvalidReservationDataError.name;
  }
}
