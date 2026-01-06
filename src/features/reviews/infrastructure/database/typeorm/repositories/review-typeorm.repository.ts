import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Review as ReviewEntity,
  ReviewNotFoundError,
  ReviewRestaurantNotFoundError,
} from '../../../../domain';
import {
  ListReviewsQuery,
  ListRestaurantReviewsQuery,
} from '../../../../application/dto';
import { PaginatedResult } from '@shared/application/types';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination';
import { type ReviewRepositoryPort } from '../../../../application/ports';
import { IReviewDomainRepositoryPort } from '../../../../domain/repositories';
import { ReviewOrmEntity } from '../orm';
import { ReviewOrmMapper } from '../mappers';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure';

/**
 * Review repository implementation.
 *
 * Note: user_id is stored as a UUID reference to Auth MS.
 * We do NOT validate that the user exists - we trust the JWT token.
 */
@Injectable()
export class ReviewTypeOrmRepository
  implements ReviewRepositoryPort, IReviewDomainRepositoryPort
{
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly reviews: Repository<ReviewOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async save(review: ReviewEntity): Promise<ReviewEntity> {
    const snapshot = review.snapshot();

    const existing = await this.reviews.findOne({
      where: { id: snapshot.id },
      relations: ['restaurant'],
    });

    let restaurant = existing?.restaurant;

    if (!existing) {
      const foundRestaurant = await this.restaurants.findOne({
        where: { id: snapshot.restaurantId },
      });

      restaurant = foundRestaurant ?? undefined;

      if (!restaurant) {
        throw new ReviewRestaurantNotFoundError(snapshot.restaurantId);
      }
    }

    const entity = ReviewOrmMapper.toOrmEntity(review, {
      existing: existing ?? undefined,
      restaurant,
    });

    const saved = await this.reviews.save(entity);
    return ReviewOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<ReviewEntity | null> {
    const entity = await this.reviews.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    return entity ? ReviewOrmMapper.toDomain(entity) : null;
  }

  async findByUserAndRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<ReviewEntity | null> {
    const entity = await this.reviews.findOne({
      where: {
        userId,
        restaurant: { id: restaurantId },
      },
      relations: ['restaurant'],
    });

    return entity ? ReviewOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.reviews.delete({ id });
    if (!result.affected) {
      throw new ReviewNotFoundError(id);
    }
  }

  async paginate(
    query: ListReviewsQuery,
  ): Promise<PaginatedResult<ReviewEntity>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedResult<ReviewEntity>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ReviewOrmEntity> {
    const alias = 'review';
    return this.reviews
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<ReviewOrmEntity>,
    query: ListReviewsQuery,
  ): Promise<PaginatedResult<ReviewEntity>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.createdAt`,
      rating: `${alias}.rating`,
      restaurant: `restaurant.name`,
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.comment`, `restaurant.name`],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        ReviewOrmMapper.toDomain(entity),
      ),
    };
  }
}
