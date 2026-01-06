import { UseCase } from '@shared/application/ports/use-case.port';
import { ReviewDomainService } from '../../domain';
import { ReviewMapper } from '../mappers';
import { ReviewResponseDto, CreateReviewCommand } from '../dto';
export class CreateReviewUseCase
  implements UseCase<CreateReviewCommand, ReviewResponseDto>
{
  constructor(private readonly reviewDomainService: ReviewDomainService) {}

  async execute(command: CreateReviewCommand): Promise<ReviewResponseDto> {
    const review = await this.reviewDomainService.createReview({
      restaurantId: command.restaurantId,
      userId: command.userId,
      firstName: command.firstName ?? null,
      lastName: command.lastName ?? null,
      rating: command.rating,
      comment: command.comment,
    });

    return ReviewMapper.toResponse(review);
  }
}
