export class InvalidReviewDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InvalidReviewDataError.name;
  }
}
