import { Review } from '../../domain/entities/review.entity.js';
import { ReviewResponseDto } from '../dto/output/review.response.dto.js';

export class ReviewMapper {
  static toResponse(review: Review): ReviewResponseDto {
    const snapshot = review.snapshot();
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      userId: snapshot.userId,
      rating: snapshot.rating,
      comment: snapshot.comment,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
