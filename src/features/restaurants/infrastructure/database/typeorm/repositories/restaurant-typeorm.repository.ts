import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  RestaurantEntity,
  RestaurantOwnerNotFoundError,
  RestaurantNotFoundError,
} from '../../../../domain';
import {
  ListNearbyRestaurantsQuery,
  ListRestaurantsQuery,
  RestaurantOwnerOptionDto,
} from '../../../../application/dto';
import { PaginatedResult } from '@shared/application/types';
import { RestaurantRepositoryPort } from '../../../../application/ports';
import { RestaurantOrmEntity } from '../orm/restaurant.orm-entity';
import { RestaurantOrmMapper } from '../mappers';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination';
import { IRestaurantDomainRepositoryPort } from '../../../../domain/repositories/restaurant-domain-repository.port';
import type {
  RestaurantCreate,
  RestaurantUpdate,
} from '../../../../domain/types';
import { IRestaurantOwnerPort } from '../../../../domain/ports/restaurant-owner.port';

/**
 * Restaurant TypeORM Repository.
 *
 * ARCHITECTURE NOTE: Users live in Auth MS only.
 * We store `ownerId` as a UUID reference without FK constraint.
 * We trust that if a JWT is valid, the user exists in Auth MS.
 * For owner name/email display, the frontend should call Auth MS or we can add a sync mechanism.
 */
@Injectable()
export class RestaurantTypeOrmRepository
  extends RestaurantRepositoryPort
  implements IRestaurantDomainRepositoryPort
{
  constructor(
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurantRepository: Repository<RestaurantOrmEntity>,
    @Inject(IRestaurantOwnerPort)
    private readonly ownerPort: IRestaurantOwnerPort,
  ) {
    super();
  }

  async save(restaurant: RestaurantEntity): Promise<RestaurantEntity> {
    if (!restaurant.ownerId) {
      throw new RestaurantOwnerNotFoundError(null);
    }

    // Trust the JWT - if we have an ownerId, the owner exists in Auth MS
    const ownerExists = await this.ownerPort.exists(restaurant.ownerId);
    if (!ownerExists) {
      throw new RestaurantOwnerNotFoundError(restaurant.ownerId);
    }

    const entity = RestaurantOrmMapper.toOrmEntity(restaurant);
    const saved = await this.restaurantRepository.save(entity);

    return RestaurantOrmMapper.toDomain(saved);
  }

  async create(data: RestaurantCreate): Promise<RestaurantEntity> {
    // Trust the JWT - if we have an ownerId, the owner exists in Auth MS
    const ownerExists = await this.ownerPort.exists(data.ownerId);
    if (!ownerExists) {
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
      relations: ['sections', 'sections.tables'],
    });

    if (!entity) {
      return null;
    }

    return RestaurantOrmMapper.toDomain(entity);
  }

  async findAll(): Promise<RestaurantEntity[]> {
    const entities = await this.restaurantRepository.find({
      relations: ['sections', 'sections.tables'],
    });

    return entities.map((entity) => RestaurantOrmMapper.toDomain(entity));
  }

  async findByName(name: string): Promise<RestaurantEntity | null> {
    const entity = await this.restaurantRepository.findOne({
      where: { name },
      relations: ['sections', 'sections.tables'],
    });

    if (!entity) {
      return null;
    }

    return RestaurantOrmMapper.toDomain(entity);
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
    const qb = this.buildBaseQuery().where('restaurant.ownerId = :ownerId', {
      ownerId,
    });
    return this.execPagination(qb, query);
  }

  /**
   * List unique restaurant owners.
   *
   * NOTE: This method returns only the ownerId. Owner name/email should be
   * fetched from Auth MS by the calling service or frontend.
   * This is intentional - users live in Auth MS only.
   */
  async listOwners(): Promise<RestaurantOwnerOptionDto[]> {
    const alias = 'restaurant';
    const rows = await this.restaurantRepository
      .createQueryBuilder(alias)
      .select(`${alias}.ownerId`, 'ownerId')
      .distinct(true)
      .where(`${alias}.ownerId IS NOT NULL`)
      .orderBy(`${alias}.ownerId`, 'ASC')
      .getRawMany<{ ownerId: string }>();

    // Return owner IDs only - name/email should be fetched from Auth MS
    return rows.map((row) =>
      RestaurantOwnerOptionDto.fromRaw({
        ownerId: row.ownerId,
        name: 'Owner', // Placeholder - fetch from Auth MS
        email: '', // Placeholder - fetch from Auth MS
      }),
    );
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

    // Trust the JWT - if we have an ownerId, the owner exists in Auth MS
    const ownerExists = await this.ownerPort.exists(ownerId);
    if (!ownerExists) {
      throw new RestaurantOwnerNotFoundError(ownerId);
    }

    restaurant.ownerId = ownerId;

    const saved = await this.restaurantRepository.save(restaurant);
    return RestaurantOrmMapper.toDomain(saved);
  }

  async findNearby(
    query: ListNearbyRestaurantsQuery,
  ): Promise<
    Array<{ restaurant: RestaurantEntity; distanceKm: number | null }>
  > {
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
      const distance =
        rawDistance === null || rawDistance === undefined
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

    // Apply general search term (searches in name, description, and location)
    // Split query into words and match ALL of them
    // Uses unaccent() for accent-insensitive search (e.g., "mediterranea" matches "mediterránea")
    if (query.q) {
      const searchWords = query.q
        .trim()
        .split(/\s+/)
        .filter((word) => word.length >= 2); // Ignore short words like "en", "de"

      searchWords.forEach((word, index) => {
        const paramName = `searchQ${index}`;
        qb.andWhere(
          `(unaccent(LOWER(${alias}.name)) LIKE unaccent(LOWER(:${paramName})) OR unaccent(LOWER(${alias}.description)) LIKE unaccent(LOWER(:${paramName})) OR unaccent(LOWER(${alias}.location)) LIKE unaccent(LOWER(:${paramName})))`,
          { [paramName]: `%${word}%` },
        );
      });
    }

    // Apply specific filters with accent-insensitive search
    if (query.name) {
      qb.andWhere(
        `unaccent(LOWER(${alias}.name)) LIKE unaccent(LOWER(:filterName))`,
        {
          filterName: `%${query.name}%`,
        },
      );
    }

    if (query.city) {
      qb.andWhere(
        `unaccent(LOWER(${alias}.location)) LIKE unaccent(LOWER(:filterCity))`,
        {
          filterCity: `%${query.city}%`,
        },
      );
    }

    if (query.cuisineType) {
      qb.andWhere(
        `unaccent(LOWER(${alias}.description)) LIKE unaccent(LOWER(:cuisineType))`,
        {
          cuisineType: `%${query.cuisineType}%`,
        },
      );
    }

    if (typeof query.isActive === 'boolean') {
      qb.andWhere(`${alias}.active = :isActive`, { isActive: query.isActive });
    }

    if (query.ownerId) {
      qb.andWhere('restaurant.ownerId = :filterOwnerId', {
        filterOwnerId: query.ownerId,
      });
    }

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
