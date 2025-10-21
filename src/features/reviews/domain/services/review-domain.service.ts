import { Review } from '../entities/review.entity';
import {
  ReviewNotFoundError,
  ReviewOwnershipError,
  ReviewRestaurantNotFoundError,
  ReviewUserNotFoundError,
} from '../errors';
import type { IReviewDomainRepositoryPort } from '../repositories';
import type { ReviewRestaurantPort, ReviewUserPort } from '../ports';
import {
  type ReviewCreateRequest,
  type ReviewDeleteRequest,
  type ReviewUpdateRequest,
} from '../types';

export class ReviewDomainService {
  constructor(
    private readonly reviewRepository: IReviewDomainRepositoryPort,
    private readonly restaurantPort: ReviewRestaurantPort,
    private readonly userPort: ReviewUserPort,
  ) {}

  async createReview(request: ReviewCreateRequest): Promise<Review> {
    const restaurantId = this.normalizeId(request.restaurantId);
    await this.ensureRestaurant(restaurantId);

    const userId = this.normalizeId(request.userId);
    await this.ensureUser(userId);

    const existing = await this.reviewRepository.findByUserAndRestaurant(
      userId,
      restaurantId,
    );

    if (existing) {
      existing.update({
        rating: request.rating,
        comment: request.comment ?? null,
      });
      return this.reviewRepository.save(existing);
    }

    const review = Review.create({
      restaurantId,
      userId,
      rating: request.rating,
      comment: request.comment ?? null,
    });

    return this.reviewRepository.save(review);
  }

  async updateReview(request: ReviewUpdateRequest): Promise<Review> {
    const review = await this.ensureReview(request.reviewId);
    const userId = this.normalizeId(request.userId);
    this.ensureOwnership(review, userId);

    review.update({
      rating: request.rating,
      comment: request.comment,
    });

    return this.reviewRepository.save(review);
  }

  async deleteReview(request: ReviewDeleteRequest): Promise<Review> {
    const review = await this.ensureReview(request.reviewId);
    const userId = this.normalizeId(request.userId);
    this.ensureOwnership(review, userId);

    await this.reviewRepository.delete(review.id);

    return review;
  }

  private async ensureReview(reviewId: string): Promise<Review> {
    const normalizedId = this.normalizeId(reviewId);
    const review = await this.reviewRepository.findById(normalizedId);
    if (!review) {
      throw new ReviewNotFoundError(normalizedId);
    }
    return review;
  }

  private async ensureRestaurant(restaurantId: string): Promise<void> {
    // Explicitly trust the injected port contract; ESLint can't infer the type through the DI token.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const exists = await this.restaurantPort.exists(restaurantId);
    if (!exists) {
      throw new ReviewRestaurantNotFoundError(restaurantId);
    }
  }

  private async ensureUser(userId: string): Promise<void> {
    // Explicitly trust the injected port contract; ESLint can't infer the type through the DI token.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const exists = await this.userPort.exists(userId);
    if (!exists) {
      throw new ReviewUserNotFoundError(userId);
    }
  }

  private ensureOwnership(review: Review, userId: string): void {
    if (review.userId !== userId) {
      throw new ReviewOwnershipError();
    }
  }

  private normalizeId(value: string): string {
    return value.trim();
  }
}
