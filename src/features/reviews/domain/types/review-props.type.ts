import type {
  ReviewComment,
  ReviewRating,
  ReviewRestaurantId,
  ReviewUserId,
} from '../entities/values';

export interface ReviewProps {
  restaurantId: ReviewRestaurantId;
  userId: ReviewUserId;
  rating: ReviewRating;
  comment: ReviewComment;
  createdAt: Date;
  updatedAt: Date;
}
