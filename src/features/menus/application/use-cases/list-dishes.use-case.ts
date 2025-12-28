import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';
import type { DishListResponseDto } from '../dtos/output/dish-list-response.dto';
import type { ListDishesQuery } from '../dtos/input';
import type { PaginatedResult } from '@shared/application/types';

export class ListDishesUseCase
  implements UseCase<ListDishesQuery, DishListResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
    private readonly dishMapper: DishMapper,
  ) {}

  async execute(query: ListDishesQuery): Promise<DishListResponseDto> {
    this.logger.log('Fetching paginated dishes', 'ListDishesUseCase');

    const dishesPage = await this.dishDomainService.listDishes(query);

    this.logger.log(
      `Retrieved ${dishesPage.results.length} dish(es) from ${dishesPage.total} total`,
      'ListDishesUseCase',
    );

    return {
      ...dishesPage,
      results: dishesPage.results.map((dish) =>
        this.dishMapper.fromEntitytoDTO(dish),
      ),
    };
  }
}
