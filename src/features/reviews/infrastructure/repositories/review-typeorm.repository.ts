import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../../../auth/entities/user.entity.js';
import {
  Review,
  ReviewNotFoundError,
  ReviewRestaurantNotFoundError,
  ReviewUserNotFoundError,
} from '../../domain/index.js';
import {
  ListReviewsQuery,
  ListRestaurantReviewsQuery,
} from '../../application/dto/index.js';
import { PaginatedResult } from '@shared/interfaces/pagination.js';
import { paginateQueryBuilder } from '../../../../common/pagination/paginate.js';
import { type ReviewRepositoryPort } from '../../application/ports/index.js';
import { ReviewOrmEntity } from '../orm/index.js';
import { ReviewOrmMapper } from '../mappers/index.js';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';

@Injectable()
export class ReviewTypeOrmRepository implements ReviewRepositoryPort {
  constructor(
    @InjectRepository(ReviewOrmEntity)
    private readonly reviews: Repository<ReviewOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async save(review: Review): Promise<Review> {
    const snapshot = review.snapshot();

    const existing = await this.reviews.findOne({
      where: { id: snapshot.id },
      relations: ['restaurant', 'user'],
    });

    let restaurant = existing?.restaurant;
    let user = existing?.user;

    if (!existing) {
      const [foundRestaurant, foundUser] = await Promise.all([
        this.restaurants.findOne({ where: { id: snapshot.restaurantId } }),
        this.users.findOne({ where: { id: snapshot.userId } }),
      ]);

      restaurant = foundRestaurant ?? undefined;
      user = foundUser ?? undefined;

      if (!restaurant) {
        throw new ReviewRestaurantNotFoundError(snapshot.restaurantId);
      }

      if (!user) {
        throw new ReviewUserNotFoundError(snapshot.userId);
      }
    }

    const entity = ReviewOrmMapper.toOrmEntity(review, {
      existing: existing ?? undefined,
      restaurant,
      user,
    });

    const saved = await this.reviews.save(entity);
    return ReviewOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Review | null> {
    const entity = await this.reviews.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    return entity ? ReviewOrmMapper.toDomain(entity) : null;
  }

  async findByUserAndRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<Review | null> {
    const entity = await this.reviews.findOne({
      where: {
        user: { id: userId },
        restaurant: { id: restaurantId },
      },
      relations: ['restaurant', 'user'],
    });

    return entity ? ReviewOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.reviews.delete({ id });
    if (!result.affected) {
      throw new ReviewNotFoundError(id);
    }
  }

  async paginate(query: ListReviewsQuery): Promise<PaginatedResult<Review>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedResult<Review>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ReviewOrmEntity> {
    const alias = 'review';
    return this.reviews
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<ReviewOrmEntity>,
    query: ListReviewsQuery,
  ): Promise<PaginatedResult<Review>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.created_at`,
      rating: `${alias}.rating`,
      restaurant: `restaurant.name`,
      user: `user.name`,
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
      searchable: [
        `${alias}.comment`,
        `restaurant.name`,
        `user.name`,
        `user.email`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        ReviewOrmMapper.toDomain(entity),
      ),
    };
  }
}
