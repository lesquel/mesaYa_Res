import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ReviewNotFoundError } from '../../domain/errors/review-not-found.error.js';
import { ReviewOwnershipError } from '../../domain/errors/review-ownership.error.js';
import { UpdateReviewCommand } from '../dto/input/update-review.dto.js';
import { ReviewResponseDto } from '../dto/output/review.response.dto.js';
import { ReviewMapper } from '../mappers/review.mapper.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';

@Injectable()
export class UpdateReviewUseCase
  implements UseCase<UpdateReviewCommand, ReviewResponseDto>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(command: UpdateReviewCommand): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(command.reviewId);

    if (!review) {
      throw new ReviewNotFoundError(command.reviewId);
    }

    if (review.userId !== command.userId) {
      throw new ReviewOwnershipError();
    }

    review.update({
      ...(command.rating !== undefined ? { rating: command.rating } : {}),
      ...(command.comment !== undefined ? { comment: command.comment } : {}),
    });

    const saved = await this.reviewRepository.save(review);
    return ReviewMapper.toResponse(saved);
  }
}
