import { Review } from '../entities/review.entity';
import {
  ReviewNotFoundError,
  ReviewOwnershipError,
  ReviewRestaurantNotFoundError,
  ReviewUserNotFoundError,
} from '../errors';
import { normalizeId } from '@shared/application/utils';
import type { IReviewDomainRepositoryPort } from '../repositories';
import type { ReviewRestaurantPort, ReviewUserPort } from '../ports';
import {
  type ReviewCreateRequest,
  type ReviewDeleteRequest,
  type ReviewUpdateRequest,
  type ReviewModerationRequest,
} from '../types';

export class ReviewDomainService {
  constructor(
    private readonly reviewRepository: IReviewDomainRepositoryPort,
    private readonly restaurantPort: ReviewRestaurantPort,
    private readonly userPort: ReviewUserPort,
  ) {}

  async createReview(request: ReviewCreateRequest): Promise<Review> {
    const restaurantId = normalizeId(request.restaurantId);
    await this.ensureRestaurant(restaurantId);

    const userId = normalizeId(request.userId);
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
      firstName: request.firstName ?? null,
      lastName: request.lastName ?? null,
      rating: request.rating,
      comment: request.comment ?? null,
    });

    return this.reviewRepository.save(review);
  }

  async updateReview(request: ReviewUpdateRequest): Promise<Review> {
    const review = await this.ensureReview(request.reviewId);
    const userId = normalizeId(request.userId);
    this.ensureOwnership(review, userId);

    review.update({
      rating: request.rating,
      comment: request.comment,
    });

    return this.reviewRepository.save(review);
  }

  async deleteReview(request: ReviewDeleteRequest): Promise<Review> {
    const review = await this.ensureReview(request.reviewId);
    const userId = normalizeId(request.userId);
    this.ensureOwnership(review, userId);

    await this.reviewRepository.delete(review.id);

    return review;
  }

  async moderateReview(request: ReviewModerationRequest): Promise<Review> {
    const review = await this.ensureReview(request.reviewId);

    const nextComment =
      request.hideComment === true ? null : (request.comment ?? undefined);

    review.update({
      rating: request.rating,
      comment: nextComment,
    });

    return this.reviewRepository.save(review);
  }

  /**
   * Find a review by ID
   * Returns null if not found
   */
  async findById(reviewId: string): Promise<Review | null> {
    const normalizedId = normalizeId(reviewId);
    return this.reviewRepository.findById(normalizedId);
  }

  /**
   * Save a review entity
   * Used for updating sentiment analysis results
   */
  async save(review: Review): Promise<Review> {
    return this.reviewRepository.save(review);
  }

  private async ensureReview(reviewId: string): Promise<Review> {
    const normalizedId = normalizeId(reviewId);
    const review = await this.reviewRepository.findById(normalizedId);
    if (!review) {
      throw new ReviewNotFoundError(normalizedId);
    }
    return review;
  }

  private async ensureRestaurant(restaurantId: string): Promise<void> {
    const exists = await this.restaurantPort.exists(restaurantId);
    if (!exists) {
      throw new ReviewRestaurantNotFoundError(restaurantId);
    }
  }

  private async ensureUser(userId: string): Promise<void> {
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
}
