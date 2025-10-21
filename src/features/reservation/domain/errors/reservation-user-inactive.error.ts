export class ReservationUserInactiveError extends Error {
  constructor(userId: string) {
    super(`User ${userId} is not allowed to create reservations`);
    this.name = ReservationUserInactiveError.name;
  }
}
