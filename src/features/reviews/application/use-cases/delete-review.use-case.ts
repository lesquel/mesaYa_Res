import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ReviewNotFoundError } from '../../domain/errors/review-not-found.error.js';
import { ReviewOwnershipError } from '../../domain/errors/review-ownership.error.js';
import { DeleteReviewCommand } from '../dto/input/delete-review.command.js';
import { DeleteReviewResponseDto } from '../dto/output/delete-review.response.js';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';

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

    await this.reviewRepository.delete(command.reviewId);

    return { ok: true };
  }
}
