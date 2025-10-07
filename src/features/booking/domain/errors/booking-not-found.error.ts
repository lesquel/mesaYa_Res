export class BookingNotFoundError extends Error {
  constructor(public readonly bookingId: string) {
    super(`Booking ${bookingId} not found`);
    this.name = BookingNotFoundError.name;
  }
}
