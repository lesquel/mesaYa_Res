import { describe, it, expect } from '@jest/globals';
import { ListReviewsUseCase } from '@features/reviews/application/use-cases/list-reviews.use-case';
import { Review } from '@features/reviews/domain/entities/review.entity';
import type { PaginatedResult } from '@shared/application/types/pagination';

class InMemoryReviewRepository {
  public lastQuery: any;
  constructor(private readonly result: PaginatedResult<Review>) {}

  async paginate(query: any): Promise<PaginatedResult<Review>> {
    this.lastQuery = query;
    return this.result;
  }
}

describe('ListReviewsUseCase', () => {
  it('maps paginated reviews into DTOs', async () => {
    const review = Review.rehydrate({
      id: 'r-1',
      restaurantId: 'rest-1',
      userId: 'user-1',
      rating: 4,
      comment: 'Nice',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    });

    const paginated: PaginatedResult<Review> = {
      results: [review],
      total: 1,
      page: 1,
      limit: 10,
      offset: 0,
      pages: 1,
      hasNext: false,
      hasPrev: false,
      links: { self: '/public/reviews?page=1', first: '/public/reviews?page=1', last: '/public/reviews?page=1' },
    };

    const repo = new InMemoryReviewRepository(paginated as any);
    const useCase = new ListReviewsUseCase(repo as any);

    const query = { pagination: { page: 1, limit: 10, offset: 0 }, route: '/public/reviews' } as any;
    const response = await useCase.execute(query);

    expect(repo.lastQuery).toEqual(query);
    expect(response.total).toBe(1);
    expect(response.results[0]).toEqual(expect.objectContaining({ userId: 'user-1' }));
  });
});
