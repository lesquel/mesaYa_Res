import { InvalidReviewDataError } from '../../errors/invalid-review-data.error';

export class ReviewRestaurantId {
  private readonly internal: string;

  constructor(value: string) {
    const normalized = value?.trim();

    if (!normalized) {
      throw new InvalidReviewDataError('Restaurant id is required');
    }

    this.internal = normalized;
  }

  get value(): string {
    return this.internal;
  }
}
