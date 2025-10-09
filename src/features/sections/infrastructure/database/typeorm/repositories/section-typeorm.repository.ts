import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Section,
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
} from '@features/sections/domain/index.js';
import { SectionOrmEntity } from '../orm/index.js';
import { SectionOrmMapper } from '../mappers/index.js';
import { RestaurantOrmEntity } from '../../../../../restaurants/infrastructure/index.js';
import { ListSectionsQuery } from '@features/sections/application/dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate.js';
import { type SectionRepositoryPort } from '@features/sections/application/ports/index.js';

@Injectable()
export class SectionTypeOrmRepository implements SectionRepositoryPort {
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
    return this.executePagination(qb, query);
  }

  async delete(id: string): Promise<void> {
    const result = await this.sections.delete({ id });
    if (!result.affected) {
      throw new SectionNotFoundError(id);
    }
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
