import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ReviewNotFoundError } from '../../domain/errors/review-not-found.error.js';
import { FindReviewQuery } from '../dto/input/find-review.query.js';
import { ReviewResponseDto } from '../dto/output/review.response.dto.js';
import { ReviewMapper } from '../mappers/review.mapper.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';

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
