export class BookingUserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User ${userId} not found`);
    this.name = BookingUserNotFoundError.name;
  }
}
