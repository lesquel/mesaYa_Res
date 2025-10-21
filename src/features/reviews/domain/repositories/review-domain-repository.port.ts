import { Review } from '../entities/review.entity';

export abstract class IReviewDomainRepositoryPort {
  abstract save(review: Review): Promise<Review>;
  abstract findById(reviewId: string): Promise<Review | null>;
  abstract delete(reviewId: string): Promise<void>;
  abstract findByUserAndRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<Review | null>;
}
