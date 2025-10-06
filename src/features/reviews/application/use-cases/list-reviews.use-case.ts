import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/interfaces/use-case.js';
import { ListReviewsQuery, PaginatedReviewResponse } from '../dto/index.js';
import { ReviewMapper } from '../mappers/index.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class ListReviewsUseCase
  implements UseCase<ListReviewsQuery, PaginatedReviewResponse>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(query: ListReviewsQuery): Promise<PaginatedReviewResponse> {
    const result = await this.reviewRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((review) => ReviewMapper.toResponse(review)),
    };
  }
}
