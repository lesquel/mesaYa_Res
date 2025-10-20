import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ListReviewsQuery, PaginatedReviewResponse } from '../dto/index';
import { ReviewMapper } from '../mappers/index';
import { REVIEW_REPOSITORY, type ReviewRepositoryPort } from '../ports/index';

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
