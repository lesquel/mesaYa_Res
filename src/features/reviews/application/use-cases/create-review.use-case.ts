import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain/index';
import { ReviewMapper } from '../mappers/index';
import { ReviewResponseDto, CreateReviewCommand } from '../dto/index';
export class CreateReviewUseCase
  implements UseCase<CreateReviewCommand, ReviewResponseDto>
{
  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(command: CreateReviewCommand): Promise<ReviewResponseDto> {
    const review = await this.reviewDomainService.createReview({
      restaurantId: command.restaurantId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment,
    });

    return ReviewMapper.toResponse(review);
  }
}
