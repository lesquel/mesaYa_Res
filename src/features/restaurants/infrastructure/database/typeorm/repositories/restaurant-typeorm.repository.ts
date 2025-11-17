import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  RestaurantEntity,
  RestaurantOwnerNotFoundError,
  RestaurantNotFoundError,
} from '../../../../domain';
import {
  ListNearbyRestaurantsQuery,
  ListRestaurantsQuery,
} from '../../../../application/dto';
import { PaginatedResult } from '@shared/application/types/pagination';
import { RestaurantRepositoryPort } from '../../../../application/ports';
import { RestaurantOrmEntity } from '../orm';
import { RestaurantOrmMapper } from '../mappers';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { IRestaurantDomainRepositoryPort } from '../../../../domain/repositories/restaurant-domain-repository.port';
import type {
  RestaurantCreate,
  RestaurantUpdate,
} from '../../../../domain/types';
import { RestaurantOwnerOptionDto } from '../../../../application/dto';

@Injectable()
export class RestaurantTypeOrmRepository
  extends RestaurantRepositoryPort
  implements IRestaurantDomainRepositoryPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurantRepository: Repository<RestaurantOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async save(restaurant: RestaurantEntity): Promise<RestaurantEntity> {
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

  async create(data: RestaurantCreate): Promise<RestaurantEntity> {
    const owner = await this.userRepository.findOne({
      where: { id: data.ownerId },
    });

    if (!owner) {
      throw new RestaurantOwnerNotFoundError(data.ownerId);
    }

    const restaurant = RestaurantEntity.create(data);
    return this.save(restaurant);
  }

  async update(data: RestaurantUpdate): Promise<RestaurantEntity | null> {
    const existing = await this.findById(data.id);

    if (!existing) {
      return null;
    }

    existing.update(data);
    return this.save(existing);
  }

  async findById(id: string): Promise<RestaurantEntity | null> {
    const entity = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner', 'sections', 'sections.tables'],
    });

    if (!entity) {
      return null;
    }

    return RestaurantOrmMapper.toDomain(entity);
  }

  async findAll(): Promise<RestaurantEntity[]> {
    const entities = await this.restaurantRepository.find({
      relations: ['owner', 'sections', 'sections.tables'],
    });

    return entities.map((entity) => RestaurantOrmMapper.toDomain(entity));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.restaurantRepository.delete({ id });
    if (!result.affected) {
      throw new RestaurantNotFoundError(id);
    }
    return true;
  }

  async paginate(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, query);
  }

  async paginateByOwner(
    ownerId: string,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>> {
    const qb = this.buildBaseQuery().where('owner.id = :ownerId', { ownerId });
    return this.execPagination(qb, query);
  }

  async listOwners(): Promise<RestaurantOwnerOptionDto[]> {
    const alias = 'restaurant';
    const rows = await this.restaurantRepository
      .createQueryBuilder(alias)
      .innerJoin(`${alias}.owner`, 'owner')
      .select('owner.id', 'ownerId')
      .addSelect('owner.name', 'name')
      .addSelect('owner.email', 'email')
      .groupBy('owner.id')
      .addGroupBy('owner.name')
      .addGroupBy('owner.email')
      .orderBy('owner.name', 'ASC')
      .getRawMany<{ ownerId: string; name: string; email: string }>();

    return RestaurantOwnerOptionDto.fromArray(rows);
  }

  async assignOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new RestaurantNotFoundError(restaurantId);
    }

    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new RestaurantOwnerNotFoundError(ownerId);
    }

    restaurant.owner = owner;
    restaurant.ownerId = ownerId;

    const saved = await this.restaurantRepository.save(restaurant);
    return RestaurantOrmMapper.toDomain(saved);
  }

  async findNearby(
    query: ListNearbyRestaurantsQuery,
  ): Promise<Array<{ restaurant: RestaurantEntity; distanceKm: number | null }>> {
    const alias = 'restaurant';
    const distanceExpression = this.buildDistanceExpression(alias);

    const qb = this.buildBaseQuery()
      .andWhere(`${alias}.locationLatitude IS NOT NULL`)
      .andWhere(`${alias}.locationLongitude IS NOT NULL`)
      .addSelect(distanceExpression, 'distanceKm')
      .setParameters({
        centerLat: query.latitude,
        centerLng: query.longitude,
      })
      .orderBy('distanceKm', 'ASC')
      .take(query.limit ?? 10);

    if (query.radiusKm) {
      qb.andWhere(`${distanceExpression} <= :radiusKm`, {
        centerLat: query.latitude,
        centerLng: query.longitude,
        radiusKm: query.radiusKm,
      });
    }

    const { entities, raw } = await qb.getRawAndEntities();

    return entities.map((entity, index) => {
      const rawDistance = raw[index]?.distanceKm;
      const distance = rawDistance === null || rawDistance === undefined
        ? null
        : Number(rawDistance);
      const restaurant = RestaurantOrmMapper.toDomain(entity);
      restaurant.setComputedDistance(distance);
      return { restaurant, distanceKm: distance ?? null };
    });
  }

  private buildBaseQuery(): SelectQueryBuilder<RestaurantOrmEntity> {
    const alias = 'restaurant';
    return this.restaurantRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.owner`, 'owner')
      .leftJoinAndSelect(`${alias}.sections`, 'section')
      .leftJoinAndSelect('section.tables', 'table');
  }

  private buildDistanceExpression(alias: string): string {
    return `(
      6371 * acos(
        cos(radians(:centerLat)) * cos(radians(${alias}.location_latitude)) *
        cos(radians(${alias}.location_longitude) - radians(:centerLng)) +
        sin(radians(:centerLat)) * sin(radians(${alias}.location_latitude))
      )
    )`;
  }

  private async execPagination(
    qb: SelectQueryBuilder<RestaurantOrmEntity>,
    query: ListRestaurantsQuery,
  ): Promise<PaginatedResult<RestaurantEntity>> {
    const alias = qb.alias;
    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      location: `${alias}.location`,
      totalCapacity: `${alias}.totalCapacity`,
      openTime: `${alias}.openTime`,
      closeTime: `${alias}.closeTime`,
      createdAt: `${alias}.createdAt`,
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
