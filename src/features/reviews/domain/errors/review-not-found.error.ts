export class ReviewNotFoundError extends Error {
  constructor(public readonly reviewId: string) {
    super(`Review ${reviewId} not found`);
    this.name = ReviewNotFoundError.name;
  }
}
