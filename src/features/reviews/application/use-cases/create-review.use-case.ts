import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/core/use-case.js';
import { Review } from '../../domain/entities';
import {
  ReviewRestaurantNotFoundError,
  ReviewUserNotFoundError,
} from '../../domain/errors';
import { ReviewMapper } from '../mappers';
import { ReviewResponseDto } from '../dto/output';
import { CreateReviewCommand } from '../dto/input';
import {
  REVIEW_REPOSITORY,
  type ReviewRepositoryPort,
} from '../ports/review-repository.port.js';
import {
  RESTAURANT_REVIEW_READER,
  type RestaurantReviewReaderPort,
} from '../ports/restaurant-reader.port.js';
import {
  USER_REVIEW_READER,
  type UserReviewReaderPort,
} from '../ports/user-reader.port.js';

@Injectable()
export class CreateReviewUseCase
  implements UseCase<CreateReviewCommand, ReviewResponseDto>
{
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
    @Inject(RESTAURANT_REVIEW_READER)
    private readonly restaurantReader: RestaurantReviewReaderPort,
    @Inject(USER_REVIEW_READER)
    private readonly userReader: UserReviewReaderPort,
  ) {}

  async execute(command: CreateReviewCommand): Promise<ReviewResponseDto> {
    const restaurantExists = await this.restaurantReader.exists(
      command.restaurantId,
    );
    if (!restaurantExists) {
      throw new ReviewRestaurantNotFoundError(command.restaurantId);
    }

    const userExists = await this.userReader.exists(command.userId);
    if (!userExists) {
      throw new ReviewUserNotFoundError(command.userId);
    }

    const existing = await this.reviewRepository.findByUserAndRestaurant(
      command.userId,
      command.restaurantId,
    );

    if (existing) {
      existing.update({
        rating: command.rating,
        comment: command.comment ?? null,
      });
      const savedExisting = await this.reviewRepository.save(existing);
      return ReviewMapper.toResponse(savedExisting);
    }

    const review = Review.create({
      restaurantId: command.restaurantId,
      userId: command.userId,
      rating: command.rating,
      comment: command.comment ?? null,
    });

    const saved = await this.reviewRepository.save(review);
    return ReviewMapper.toResponse(saved);
  }
}
