export class ReservationUserTimeConflictError extends Error {
  constructor(userId: string, startAt: Date) {
    super(
      `User ${userId} already holds a reservation near ${startAt.toISOString()}`,
    );
    this.name = ReservationUserTimeConflictError.name;
  }
}
