import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Section,
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
} from '../../../../domain';
import { ISectionDomainRepositoryPort } from '../../../../domain/repositories';
import { SectionOrmEntity } from '../orm/section.orm-entity';
import { SectionOrmMapper } from '../mappers';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import {
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
} from '../../../../application/dto';
import { PaginatedResult } from '@shared/application/types/pagination';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { type SectionRepositoryPort } from '../../../../application/ports';

// Repositorio TypeORM que implementa los puertos del dominio para Sections.
// Mantiene la responsabilidad de traducir entre `SectionOrmEntity` y `Section`.

@Injectable()
export class SectionTypeOrmRepository
  implements SectionRepositoryPort, ISectionDomainRepositoryPort
{
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly sections: Repository<SectionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async save(section: Section): Promise<Section> {
    const snapshot = section.snapshot();

    const existing = await this.sections.findOne({
      where: { id: snapshot.id },
      relations: ['restaurant'],
    });

    let restaurant = existing?.restaurant ?? null;

    if (!restaurant || restaurant.id !== snapshot.restaurantId) {
      restaurant = await this.restaurants.findOne({
        where: { id: snapshot.restaurantId },
      });

      if (!restaurant) {
        throw new SectionRestaurantNotFoundError(snapshot.restaurantId);
      }
    }

    const entity = SectionOrmMapper.toOrmEntity(section, {
      existing: existing ?? undefined,
      restaurant,
    });

    const saved = await this.sections.save(entity);
    return SectionOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Section | null> {
    const entity = await this.sections.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    return entity ? SectionOrmMapper.toDomain(entity) : null;
  }

  async paginate(query: ListSectionsQuery): Promise<PaginatedResult<Section>> {
    const qb = this.buildBaseQuery();
    if (query.restaurantId) {
      qb.andWhere('restaurant.id = :restaurantId', {
        restaurantId: query.restaurantId,
      });
    }
    if (query.restaurantIds && query.restaurantIds.length > 0) {
      qb.andWhere('restaurant.id IN (:...restaurantIds)', {
        restaurantIds: query.restaurantIds,
      });
    }
    // @ts-ignore
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedResult<Section>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  async delete(id: string): Promise<void> {
    const result = await this.sections.delete({ id });
    if (!result.affected) {
      throw new SectionNotFoundError(id);
    }
  }

  async findByRestaurantAndName(
    restaurantId: string,
    name: string,
  ): Promise<Section | null> {
    const entity = await this.sections.findOne({
      where: { restaurantId, name },
    });

    return entity ? SectionOrmMapper.toDomain(entity) : null;
  }

  private buildBaseQuery(): SelectQueryBuilder<SectionOrmEntity> {
    const alias = 'section';
    return this.sections
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<SectionOrmEntity>,
    query: ListSectionsQuery,
  ): Promise<PaginatedResult<Section>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      restaurant: `restaurant.name`,
      width: `${alias}.width`,
      height: `${alias}.height`,
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.name`, `${alias}.description`, `restaurant.name`],
      q: query.search,
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        SectionOrmMapper.toDomain(entity),
      ),
    };
  }
}
