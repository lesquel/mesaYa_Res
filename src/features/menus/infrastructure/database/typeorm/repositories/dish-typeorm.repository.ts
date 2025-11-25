import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type {
  PaginatedQueryParams,
  PaginatedResult,
} from '@shared/application/types/pagination';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import {
  IDishRepositoryPort,
  DishEntity,
  DishCreate,
  DishUpdate,
} from '@features/menus/domain';
import { DishOrmEntity } from '../orm';
import { DishOrmMapper } from '../mappers';

// Repositorio de platos (Dish). Las transformaciones de entidad/ORM
// se hacen mediante `DishOrmMapper`.

@Injectable()
export class DishTypeOrmRepository extends IDishRepositoryPort {
  constructor(
    @InjectRepository(DishOrmEntity)
    private readonly dishes: Repository<DishOrmEntity>,
  ) {
    super();
  }

  async create(data: DishCreate): Promise<DishEntity> {
    const entity = DishOrmMapper.fromCreate(data, data.menuId);
    const saved = await this.dishes.save(entity);
    return DishOrmMapper.toDomain(saved);
  }

  async update(data: DishUpdate): Promise<DishEntity | null> {
    const entity = await this.dishes.findOne({ where: { id: data.dishId } });

    if (!entity) {
      return null;
    }

    const updated = DishOrmMapper.applyUpdate(entity, data);
    const saved = await this.dishes.save(updated);
    return DishOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<DishEntity | null> {
    const entity = await this.dishes.findOne({ where: { id } });
    return entity ? DishOrmMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<DishEntity[]> {
    const entities = await this.dishes.find();
    return entities.map((dish) => DishOrmMapper.toDomain(dish));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dishes.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  async paginate(
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>> {
    const qb = this.buildBaseQuery();
    return this.execPagination(qb, params);
  }

  async paginateByRestaurant(
    restaurantId: string,
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>> {
    const qb = this.buildBaseQuery().where(
      'dish.restaurantId = :restaurantId',
      {
        restaurantId,
      },
    );
    return this.execPagination(qb, params);
  }

  async paginateByMenu(
    menuId: string,
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>> {
    const qb = this.buildBaseQuery().where('dish.menuId = :menuId', {
      menuId,
    });
    return this.execPagination(qb, params);
  }

  private buildBaseQuery(): SelectQueryBuilder<DishOrmEntity> {
    return this.dishes.createQueryBuilder('dish');
  }

  private async execPagination(
    qb: SelectQueryBuilder<DishOrmEntity>,
    params: PaginatedQueryParams,
  ): Promise<PaginatedResult<DishEntity>> {
    const paginationResult = await paginateQueryBuilder(qb, {
      ...params,
      route: params.route,
      allowedSorts: ['dish.name', 'dish.price', 'dish.createdAt'],
      searchable: ['dish.name', 'dish.description'],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((dish) =>
        DishOrmMapper.toDomain(dish),
      ),
    };
  }
}
