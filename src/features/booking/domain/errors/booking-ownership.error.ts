export class BookingOwnershipError extends Error {
  constructor() {
    super('You can only operate on bookings that you created');
    this.name = BookingOwnershipError.name;
  }
}
