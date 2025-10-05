import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/use-case.js';
import { ListReviewsQuery } from '../dto/input';
import { PaginatedReviewResponse } from '../dto/output';
import { ReviewMapper } from '../mappers';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';

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
