import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain/index';
import { UpdateReviewCommand, ReviewResponseDto } from '../dto/index';
import { ReviewMapper } from '../mappers/index';
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
