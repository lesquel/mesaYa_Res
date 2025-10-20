import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  ReviewNotFoundError,
  ReviewOwnershipError,
} from '../../domain/index.js';
import { DeleteReviewCommand, DeleteReviewResponseDto } from '../dto/index.js';
import { ReviewMapper } from '../mappers/index.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class DeleteReviewUseCase
  implements UseCase<DeleteReviewCommand, DeleteReviewResponseDto>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(
    command: DeleteReviewCommand,
  ): Promise<DeleteReviewResponseDto> {
    const review = await this.reviewRepository.findById(command.reviewId);

    if (!review) {
      throw new ReviewNotFoundError(command.reviewId);
    }

    if (review.userId !== command.userId) {
      throw new ReviewOwnershipError();
    }

    const reviewResponse = ReviewMapper.toResponse(review);

    await this.reviewRepository.delete(command.reviewId);

    return { ok: true, review: reviewResponse };
  }
}
