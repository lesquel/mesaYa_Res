import { Review } from '../../../../domain';
import { ReviewOrmEntity } from '../orm';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';

/**
 * Mapper for Review ORM entities.
 *
 * Note: userId is stored as a plain UUID reference to Auth MS.
 * We don't join with any user table - the user data comes from JWT.
 */
export class ReviewOrmMapper {
  static toDomain(entity: ReviewOrmEntity): Review {
    const restaurantId = entity.restaurantId ?? entity.restaurant?.id;
    const userId = entity.userId;

    if (!restaurantId || !userId) {
      throw new Error('Review entity is missing relation identifiers');
    }

    return Review.rehydrate({
      id: entity.id,
      restaurantId,
      userId,
      firstName: entity.firstName ?? null,
      lastName: entity.lastName ?? null,
      rating: entity.rating,
      comment: entity.comment ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrmEntity(
    review: Review,
    relations: {
      restaurant?: RestaurantOrmEntity;
      existing?: ReviewOrmEntity;
    } = {},
  ): ReviewOrmEntity {
    const snapshot = review.snapshot();
    const entity = relations.existing ?? new ReviewOrmEntity();

    entity.id = snapshot.id;
    entity.userId = snapshot.userId;
    entity.firstName = snapshot.firstName ?? null;
    entity.lastName = snapshot.lastName ?? null;
    entity.rating = snapshot.rating;
    entity.comment = snapshot.comment ?? null;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;

    if (relations.restaurant) {
      entity.restaurant = relations.restaurant;
    }

    return entity;
  }
}
