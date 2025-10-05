import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ListRestaurantReviewsQuery } from '../dto/input/list-restaurant-reviews.query.js';
import { PaginatedReviewResponse } from '../dto/output/review.response.dto.js';
import { ReviewMapper } from '../mappers/review.mapper.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';

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
