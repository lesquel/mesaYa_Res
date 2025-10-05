export class ReviewUserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User ${userId} not found`);
    this.name = ReviewUserNotFoundError.name;
  }
}
