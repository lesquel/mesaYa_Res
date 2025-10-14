export class ReservationOwnershipError extends Error {
  constructor() {
    super('You can only operate on reservations that you created');
    this.name = ReservationOwnershipError.name;
  }
}
