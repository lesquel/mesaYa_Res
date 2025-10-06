import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ReviewNotFoundError } from '../../domain/index.js';
import { FindReviewQuery, ReviewResponseDto } from '../dto/index.js';
import { ReviewMapper } from '../mappers/index.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/index.js';

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
