import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/use-case.js';
import { ReviewNotFoundError } from '../../domain/errors';
import { FindReviewQuery } from '../dto/input';
import { ReviewResponseDto } from '../dto/output';
import { ReviewMapper } from '../mappers';
import { REVIEW_REPOSITORY, type ReviewRepositoryPort } from '../ports';

@Injectable()
export class FindReviewUseCase
  implements UseCase<FindReviewQuery, ReviewResponseDto>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(query: FindReviewQuery): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(query.reviewId);

    if (!review) {
      throw new ReviewNotFoundError(query.reviewId);
    }

    return ReviewMapper.toResponse(review);
  }
}
