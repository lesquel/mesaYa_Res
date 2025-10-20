import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';
import { GetDishByIdDto } from '../dtos/input/get-dish-by-id.dto';
import { DishResponseDto } from '../dtos/output/dish-response.dto';

export class GetDishByIdUseCase
  implements UseCase<GetDishByIdDto, DishResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
    private readonly dishMapper: DishMapper,
  ) {}

  async execute(dto: GetDishByIdDto): Promise<DishResponseDto> {
    this.logger.log(
      `Fetching dish with ID: ${dto.dishId}`,
      'GetDishByIdUseCase',
    );

    const dish = await this.dishDomainService.findDishById(dto.dishId);

    this.logger.log(
      `Dish retrieved successfully: ${dish.id}`,
      'GetDishByIdUseCase',
    );

    return this.dishMapper.fromEntitytoDTO(dish);
  }
}
