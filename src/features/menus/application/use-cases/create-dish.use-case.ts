import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';
import { CreateDishDto } from '../dtos/input/create-dish.dto';
import { DishResponseDto } from '../dtos/output/dish-response.dto';

export class CreateDishUseCase
  implements UseCase<CreateDishDto, DishResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
    private readonly dishMapper: DishMapper,
  ) {}

  async execute(dto: CreateDishDto): Promise<DishResponseDto> {
    this.logger.log(
      `Creating dish '${dto.name}' for restaurant ${dto.restaurantId}`,
      'CreateDishUseCase',
    );

    const dishCreate = this.dishMapper.fromCreateDtoToDomain(dto);
    const dish = await this.dishDomainService.createDish(dishCreate);

    this.logger.log(`Dish created with ID: ${dish.id}`, 'CreateDishUseCase');

    return this.dishMapper.fromEntitytoDTO(dish);
  }
}
