import { Review } from '../../domain';
import { ReviewResponseDto } from '../dto';

export class ReviewMapper {
  static toResponse(review: Review): ReviewResponseDto {
    const snapshot = review.snapshot();
    const userName = this.buildUserName(snapshot.firstName, snapshot.lastName);
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      userId: snapshot.userId,
      userName,
      rating: snapshot.rating,
      comment: snapshot.comment,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }

  private static buildUserName(
    firstName?: string | null,
    lastName?: string | null,
  ): string | null {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }
}
