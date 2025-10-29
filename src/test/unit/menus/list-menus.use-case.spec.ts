import { MoneyVO } from '@shared/domain/entities/values';
import { MenuEntity } from '@features/menus/domain/entities/menu.entity';
import { IMenuRepositoryPort } from '@features/menus/domain/repositories/menu-repository.port';
import type { MenuCreate, MenuUpdate, MenuPaginatedQuery } from '@features/menus/domain/types';
import type { PaginatedResult } from '@shared/application/types/pagination';
import { MenuDomainService } from '@features/menus/domain/services/menu-domain.service';
import { DishMapper, MenuMapper } from '@features/menus/application/mappers';
import { ListMenusUseCase } from '@features/menus/application/use-cases/list-menus.use-case';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { ListMenusQuery } from '@features/menus/application/dtos/input/list-menus.query';

class InMemoryMenuRepository extends IMenuRepositoryPort {
  public lastQuery?: MenuPaginatedQuery;

  constructor(private readonly result: PaginatedResult<MenuEntity>) {
    super();
  }

  async create(_data: MenuCreate): Promise<MenuEntity> {
    throw new Error('Method not implemented.');
  }

  async update(_data: MenuUpdate): Promise<MenuEntity | null> {
    throw new Error('Method not implemented.');
  }

  async findById(_id: string): Promise<MenuEntity | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<MenuEntity[]> {
    return this.result.results;
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async paginate(
    query: MenuPaginatedQuery,
  ): Promise<PaginatedResult<MenuEntity>> {
    this.lastQuery = query;
    return this.result;
  }
}

describe('ListMenusUseCase', () => {
  const logger: ILoggerPort = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const dishMapper = new DishMapper();
  const menuMapper = new MenuMapper(dishMapper);

  const menu = MenuEntity.rehydrate({
    menuId: 'menu-1',
    restaurantId: 'restaurant-1',
    name: 'Menu del día',
    description: 'Opciones variadas',
    price: new MoneyVO(12.5),
    imageUrl: 'https://example.com/menu.jpg',
    dishes: [],
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  });

  const paginatedResult: PaginatedResult<MenuEntity> = {
    results: [menu],
    total: 1,
    page: 1,
    limit: 10,
    offset: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
    links: {
      self: '/public/menus?page=1',
      first: '/public/menus?page=1',
      last: '/public/menus?page=1',
    },
  };

  it('maps paginated domain results into DTOs and forwards query to repository', async () => {
    const repository = new InMemoryMenuRepository(paginatedResult);
    const domainService = new MenuDomainService(repository);
    const useCase = new ListMenusUseCase(logger, domainService, menuMapper);

    const query: ListMenusQuery = {
      pagination: { page: 1, limit: 10, offset: 0 },
      route: '/public/menus',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    const response = await useCase.execute(query);

    expect(repository.lastQuery).toEqual(query);
    expect(response.total).toBe(1);
    expect(response.results).toHaveLength(1);
    expect(response.results[0]).toEqual(
      expect.objectContaining({
        menuId: 'menu-1',
        restaurantId: 'restaurant-1',
        name: 'Menu del día',
      }),
    );
  });
});
