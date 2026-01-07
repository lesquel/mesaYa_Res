import type {
  ReviewComment,
  ReviewRating,
  ReviewRestaurantId,
  ReviewUserId,
  ReviewSentiment,
} from '../entities/values';

export interface ReviewProps {
  restaurantId: ReviewRestaurantId;
  userId: ReviewUserId;
  firstName?: string | null;
  lastName?: string | null;
  rating: ReviewRating;
  comment: ReviewComment;
  sentiment?: ReviewSentiment | null;
  createdAt: Date;
  updatedAt: Date;
}
