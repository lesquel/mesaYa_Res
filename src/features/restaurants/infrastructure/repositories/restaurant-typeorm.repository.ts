import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Restaurant,
  RestaurantOwnerNotFoundError,
  RestaurantNotFoundError,
} from '../../domain/index.js';
import { ListRestaurantsQuery } from '../../application/dto/index.js';
import { PaginatedResult } from '../../../../shared/core/pagination.js';
import { type RestaurantRepositoryPort } from '../../application/ports/index.js';
import { RestaurantOrmEntity } from '../orm/index.js';
import { RestaurantOrmMapper } from '../mappers/index.js';
import { User } from '../../../../auth/entities/user.entity.js';
import { paginateQueryBuilder } from '../../../../common/pagination/paginate.js';

@Injectable()
export class RestaurantTypeOrmRepository implements RestaurantRepositoryPort {
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurantRepository: Repository<RestaurantOrmEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(restaurant: Restaurant): Promise<Restaurant> {
    if (!restaurant.ownerId) {
      throw new RestaurantOwnerNotFoundError(null);
    }
    const owner = await this.userRepository.findOne({
      where: { id: restaurant.ownerId },
    });

    if (!owner) {
      throw new RestaurantOwnerNotFoundError(restaurant.ownerId);
    }

    const entity = RestaurantOrmMapper.toOrmEntity(restaurant, owner);
    const saved = await this.restaurantRepository.save(entity);

    return RestaurantOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const entity = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!entity) {
      return null;
    }

    return RestaurantOrmMapper.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.restaurantRepository.delete({ id });
    if (!result.affected) {
      throw new RestaurantNotFoundError(id);
    }
  }

  async paginate(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<Restaurant>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  async paginateByOwner(
    ownerId: string,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<Restaurant>> {
    const qb = this.buildBaseQuery().where('owner.id = :ownerId', { ownerId });
    return this.execPagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<RestaurantOrmEntity> {
    const alias = 'restaurant';
    return this.restaurantRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.owner`, 'owner');
  }

  private async execPagination(
    qb: SelectQueryBuilder<RestaurantOrmEntity>,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<Restaurant>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      location: `${alias}.location`,
      totalCapacity: `${alias}.total_capacity`,
      openTime: `${alias}.open_time`,
      closeTime: `${alias}.close_time`,
      createdAt: `${alias}.created_at`,
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
        `${alias}.name`,
        `${alias}.description`,
        `${alias}.location`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        RestaurantOrmMapper.toDomain(entity),
      ),
    };
  }
}
