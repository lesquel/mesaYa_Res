import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ListRestaurantReviewsQuery, PaginatedReviewResponse } from '../dto';
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
