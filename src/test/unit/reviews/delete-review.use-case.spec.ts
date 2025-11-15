import { describe, it, expect } from '@jest/globals';
import { DeleteReviewUseCase } from '@features/reviews/application/use-cases/delete-review.use-case';
import { Review } from '@features/reviews/domain/entities/review.entity';

class InMemoryReviewDomainService {
  constructor(private readonly review: Review) {}

  async deleteReview(_data: any): Promise<Review> {
    return this.review;
  }
}

describe('DeleteReviewUseCase', () => {
  it('deletes review and returns snapshot', async () => {
    const review = Review.rehydrate({
      id: 'r-1',
      restaurantId: 'rest-1',
      userId: 'user-1',
      rating: 3,
      comment: 'Ok',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    const domainService = new InMemoryReviewDomainService(review);
    const useCase = new DeleteReviewUseCase(domainService as any);

    const command = { reviewId: 'r-1', userId: 'user-1' } as any;
    const result = await useCase.execute(command);

    expect(result.ok).toBe(true);
    expect(result.review).toEqual(expect.objectContaining({ id: 'r-1' }));
  });
});
