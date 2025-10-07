export class InvalidBookingDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InvalidBookingDataError.name;
  }
}
