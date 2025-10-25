import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain';
import { UpdateReviewCommand, ReviewResponseDto } from '../dto';
import { ReviewMapper } from '../mappers';
export class UpdateReviewUseCase
  implements UseCase<UpdateReviewCommand, ReviewResponseDto>
{
  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(command: UpdateReviewCommand): Promise<ReviewResponseDto> {
    const review = await this.reviewDomainService.updateReview({
      reviewId: command.reviewId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment,
    });

    return ReviewMapper.toResponse(review);
  }
}
