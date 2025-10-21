import { InvalidReviewDataError } from '../../errors/invalid-review-data.error';

export class ReviewComment {
  private constructor(private readonly internal: string | null) {}

  static create(value: string | null | undefined): ReviewComment {
    if (value === undefined || value === null) {
      return new ReviewComment(null);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return new ReviewComment(null);
    }

    if (normalized.length > 1000) {
      throw new InvalidReviewDataError(
        'Comment must be at most 1000 characters',
      );
    }

    return new ReviewComment(normalized);
  }

  get value(): string | null {
    return this.internal;
  }
}
