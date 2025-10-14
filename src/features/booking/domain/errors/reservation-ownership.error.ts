export class ReservationOwnershipError extends Error {
  constructor() {
    super('You can only operate on bookings that you created');
    this.name = ReservationOwnershipError.name;
  }
}
