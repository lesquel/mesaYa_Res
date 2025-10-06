import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ListRestaurantReviewsQuery,
  PaginatedReviewResponse,
} from '../dto/index.js';
import { ReviewMapper } from '../mappers/index.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/index.js';

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
