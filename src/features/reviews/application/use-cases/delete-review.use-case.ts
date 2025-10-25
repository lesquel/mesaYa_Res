import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain';
import { DeleteReviewCommand, DeleteReviewResponseDto } from '../dto';
import { ReviewMapper } from '../mappers';
export class DeleteReviewUseCase
  implements UseCase<DeleteReviewCommand, DeleteReviewResponseDto>
{
  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(
    command: DeleteReviewCommand,
  ): Promise<DeleteReviewResponseDto> {
    const review = await this.reviewDomainService.deleteReview({
      reviewId: command.reviewId,
      userId: command.userId,
    });

    return { ok: true, review: ReviewMapper.toResponse(review) };
  }
}
