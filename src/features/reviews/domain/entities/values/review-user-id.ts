import { InvalidReviewDataError } from '../../errors/invalid-review-data.error';

export class ReviewUserId {
  private readonly internal: string;

  constructor(value: string) {
    const normalized = value?.trim();

    if (!normalized) {
      throw new InvalidReviewDataError('User id is required');
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
