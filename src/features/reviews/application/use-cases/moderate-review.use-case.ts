import { Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain';
import { ReviewMapper } from '../mappers';
import type { ReviewResponseDto, ModerateReviewCommand } from '../dto';

@Injectable()
export class ModerateReviewUseCase
  implements UseCase<ModerateReviewCommand, ReviewResponseDto>
{
  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(command: ModerateReviewCommand): Promise<ReviewResponseDto> {
    if (
      command.rating === undefined &&
      command.comment === undefined &&
      command.hideComment !== true
    ) {
      throw new Error('No moderation changes requested');
    }

    if (command.hideComment === true && command.comment !== undefined) {
      throw new Error('Cannot provide comment when hideComment is true');
    }

    const review = await this.reviewDomainService.moderateReview({
      reviewId: command.reviewId,
      rating: command.rating,
      comment: command.comment ?? null,
      hideComment: command.hideComment,
    });

    return ReviewMapper.toResponse(review);
  }
}
