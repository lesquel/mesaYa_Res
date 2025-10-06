import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/interfaces/use-case.js';
import {
  ReviewNotFoundError,
  ReviewOwnershipError,
} from '../../domain/index.js';
import { UpdateReviewCommand, ReviewResponseDto } from '../dto/index.js';
import { ReviewMapper } from '../mappers/index.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/index.js';

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
