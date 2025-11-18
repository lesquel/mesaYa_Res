import { describe, it, expect } from '@jest/globals';
import { CreateReviewUseCase } from '@features/reviews/application/use-cases/create-review.use-case';
import { Review } from '@features/reviews/domain/entities/review.entity';

class InMemoryReviewDomainService {
  constructor(private readonly review: Review) {}

  async createReview(_data: any): Promise<Review> {
    return this.review;
  }
}

describe('CreateReviewUseCase', () => {
  it('returns review DTO when domain creates review', async () => {
    const review = Review.rehydrate({
      id: 'r-1',
      restaurantId: 'rest-1',
      userId: 'user-1',
      rating: 5,
      comment: 'Great',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    const domainService = new InMemoryReviewDomainService(review);
    const useCase = new CreateReviewUseCase(domainService as any);

    const command = {
      restaurantId: 'rest-1',
      userId: 'user-1',
      rating: 5,
      comment: 'Great',
    } as any;
    const dto = await useCase.execute(command);

    expect(dto).toEqual(
      expect.objectContaining({ userId: 'user-1', rating: 5 }),
    );
  });
});
