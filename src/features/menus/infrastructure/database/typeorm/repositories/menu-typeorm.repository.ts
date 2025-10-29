import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IMenuRepositoryPort,
  MenuEntity,
  MenuCreate,
  MenuUpdate,
  MenuPaginatedQuery,
} from '@features/menus/domain';
import { MenuOrmEntity, DishOrmEntity } from '../orm';
import { MenuOrmMapper, DishOrmMapper } from '../mappers';
import { PaginatedResult } from '@shared/application/types/pagination';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';

@Injectable()
export class MenuTypeOrmRepository extends IMenuRepositoryPort {
  constructor(
    @InjectRepository(MenuOrmEntity)
    private readonly menus: Repository<MenuOrmEntity>,
    @InjectRepository(DishOrmEntity)
    private readonly dishes: Repository<DishOrmEntity>,
  ) {
    super();
  }

  async create(data: MenuCreate): Promise<MenuEntity> {
    const menuEntity = MenuOrmMapper.fromCreate(data);
    const savedMenu = await this.menus.save(menuEntity);

    if (data.dishes?.length) {
      const dishEntities = data.dishes.map((dish) =>
        DishOrmMapper.fromCreate(dish, savedMenu.id),
      );
      await this.dishes.save(dishEntities);
    }

    return this.findByIdOrFail(savedMenu.id);
  }

  async update(data: MenuUpdate): Promise<MenuEntity | null> {
    const menu = await this.menus.findOne({ where: { id: data.menuId } });

    if (!menu) {
      return null;
    }

    const savedMenu = await this.menus.save(
      MenuOrmMapper.applyUpdate(menu, data),
    );

    if (data.dishes?.length) {
      const dishIds = data.dishes.map((dish) => dish.dishId);
      const existingDishes = await this.dishes.find({
        where: { id: In(dishIds) },
      });
      const existingMap = new Map(
        existingDishes.map((dish) => [dish.id, dish]),
      );
      const dishesToUpdate: DishOrmEntity[] = [];

      for (const dishUpdate of data.dishes) {
        const entity = existingMap.get(dishUpdate.dishId);

        if (!entity) {
          continue;
        }

        dishesToUpdate.push(DishOrmMapper.applyUpdate(entity, dishUpdate));
      }

      if (dishesToUpdate.length > 0) {
        await this.dishes.save(dishesToUpdate);
      }
    }

    return this.findByIdOrFail(savedMenu.id);
  }

  async findById(id: string): Promise<MenuEntity | null> {
    const menu = await this.menus.findOne({ where: { id } });

    if (!menu) {
      return null;
    }

    const dishes = await this.dishes.find({ where: { menuId: id } });
    return MenuOrmMapper.toDomain(menu, dishes);
  }

  async findAll(): Promise<MenuEntity[]> {
    const menus = await this.menus.find();

    if (menus.length === 0) {
      return [];
    }

    const menuIds = menus.map((menu) => menu.id);
    const groupedDishes = await this.loadDishesGroupedByMenu(menuIds);

    return menus.map((menu) =>
      MenuOrmMapper.toDomain(menu, groupedDishes.get(menu.id) ?? []),
    );
  }

  async paginate(
    query: MenuPaginatedQuery,
  ): Promise<PaginatedResult<MenuEntity>> {
    const alias = 'menu';
    const qb = this.menus.createQueryBuilder(alias);

    if (query.restaurantId) {
      qb.andWhere(`${alias}.restaurant_id = :restaurantId`, {
        restaurantId: query.restaurantId,
      });
    }

    const sortMap: Record<string, string> = {
      name: `${alias}.name`,
      price: `${alias}.price`,
      createdAt: `${alias}.created_at`,
      updatedAt: `${alias}.updated_at`,
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
      searchable: [`${alias}.name`, `${alias}.description`],
    });

    const menuIds = paginationResult.results.map((menu) => menu.id);
    const groupedDishes = await this.loadDishesGroupedByMenu(menuIds);

    return {
      ...paginationResult,
      results: paginationResult.results.map((menu) =>
        MenuOrmMapper.toDomain(menu, groupedDishes.get(menu.id) ?? []),
      ),
    };
  }

  async delete(id: string): Promise<boolean> {
    await this.dishes.delete({ menuId: id });
    const result = await this.menus.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private async findByIdOrFail(id: string): Promise<MenuEntity> {
    const menu = await this.menus.findOne({ where: { id } });

    if (!menu) {
      throw new Error(`Menu with id ${id} not found`);
    }

    const dishes = await this.dishes.find({ where: { menuId: id } });
    return MenuOrmMapper.toDomain(menu, dishes);
  }

  private async loadDishesGroupedByMenu(
    menuIds: string[],
  ): Promise<Map<string, DishOrmEntity[]>> {
    if (menuIds.length === 0) {
      return new Map<string, DishOrmEntity[]>();
    }

    const dishes = await this.dishes.find({ where: { menuId: In(menuIds) } });
    return dishes.reduce((acc, dish) => {
      if (!dish.menuId) {
        return acc;
      }

      const collection = acc.get(dish.menuId) ?? [];
      collection.push(dish);
      acc.set(dish.menuId, collection);
      return acc;
    }, new Map<string, DishOrmEntity[]>());
  }
}
