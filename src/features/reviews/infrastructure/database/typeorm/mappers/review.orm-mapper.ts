import { Review } from '../../../../domain/index';
import { ReviewOrmEntity } from '../orm/index';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure/index';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';

export class ReviewOrmMapper {
  static toDomain(entity: ReviewOrmEntity): Review {
    const restaurantId = entity.restaurantId ?? entity.restaurant?.id;
    const userId = entity.userId ?? entity.user?.id;

    if (!restaurantId || !userId) {
      throw new Error('Review entity is missing relation identifiers');
    }

    return Review.rehydrate({
      id: entity.id,
      restaurantId,
      userId,
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
      user?: UserOrmEntity;
      existing?: ReviewOrmEntity;
    } = {},
  ): ReviewOrmEntity {
    const snapshot = review.snapshot();
    const entity = relations.existing ?? new ReviewOrmEntity();

    entity.id = snapshot.id;
    entity.rating = snapshot.rating;
    entity.comment = snapshot.comment ?? null;
    entity.createdAt = snapshot.createdAt;
    entity.updatedAt = snapshot.updatedAt;

    if (relations.restaurant) {
      entity.restaurant = relations.restaurant;
    }

    if (relations.user) {
      entity.user = relations.user;
    }

    return entity;
  }
}
