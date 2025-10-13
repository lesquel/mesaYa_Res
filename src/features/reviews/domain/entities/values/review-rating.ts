import { InvalidReviewDataError } from '../../errors/invalid-review-data.error.js';

export class ReviewRating {
  private readonly internal: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new InvalidReviewDataError(
        'Rating must be an integer between 1 and 5',
      );
    }

    this.internal = value;
  }

  get value(): number {
    return this.internal;
  }
}
