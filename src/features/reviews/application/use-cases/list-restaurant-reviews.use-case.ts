import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/use-case.js';
import { ListRestaurantReviewsQuery } from '../dto/input';
import { PaginatedReviewResponse } from '../dto/output';
import { ReviewMapper } from '../mappers';
import { REVIEW_REPOSITORY, type ReviewRepositoryPort } from '../ports';

@Injectable()
export class ListRestaurantReviewsUseCase
  implements UseCase<ListRestaurantReviewsQuery, PaginatedReviewResponse>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    const result = await this.reviewRepository.paginateByRestaurant(query);

    return {
      ...result,
      results: result.results.map((review) => ReviewMapper.toResponse(review)),
    };
  }
}
