import { describe, it, expect } from '@jest/globals';
import { UpdateReviewUseCase } from '@features/reviews/application/use-cases/update-review.use-case';
import { Review } from '@features/reviews/domain/entities/review.entity';

class InMemoryReviewDomainService {
  constructor(private readonly review: Review) {}

  async updateReview(_data: any): Promise<Review> {
    return this.review;
  }
}

describe('UpdateReviewUseCase', () => {
  it('updates review and returns dto', async () => {
    const review = Review.rehydrate({
      id: 'r-1',
      restaurantId: 'rest-1',
      userId: 'user-1',
      rating: 4,
      comment: 'Nice',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    const domainService = new InMemoryReviewDomainService(review);
    const useCase = new UpdateReviewUseCase(domainService as any);

    const command = {
      reviewId: 'r-1',
      userId: 'user-1',
      rating: 4,
      comment: 'Nice',
    } as any;
    const dto = await useCase.execute(command);

    expect(dto).toEqual(
      expect.objectContaining({ userId: 'user-1', rating: 4 }),
    );
  });
});
