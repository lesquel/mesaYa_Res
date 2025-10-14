export class ReservationUserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User ${userId} not found`);
    this.name = ReservationUserNotFoundError.name;
  }
}
