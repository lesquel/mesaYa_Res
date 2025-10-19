import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';
import { DishListResponseDto } from '../dtos/output/dish-list-response.dto';

export class ListDishesUseCase implements UseCase<void, DishListResponseDto> {
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
    private readonly dishMapper: DishMapper,
  ) {}

  async execute(): Promise<DishListResponseDto> {
    this.logger.log('Fetching all dishes', 'ListDishesUseCase');

    const dishes = await this.dishDomainService.findAllDishes();

    this.logger.log(`Retrieved ${dishes.length} dish(es)`, 'ListDishesUseCase');

    return dishes.map((dish) => this.dishMapper.fromEntitytoDTO(dish));
  }
}
