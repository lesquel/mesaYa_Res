import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DishMapper } from '../mappers';
import { UpdateDishDto } from '../dtos/input/update-dish.dto';
import { DishResponseDto } from '../dtos/output/dish-response.dto';

export class UpdateDishUseCase
  implements UseCase<UpdateDishDto, DishResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
    private readonly dishMapper: DishMapper,
  ) {}

  async execute(dto: UpdateDishDto): Promise<DishResponseDto> {
    this.logger.log(`Updating dish ${dto.dishId}`, 'UpdateDishUseCase');

    const dishUpdate = this.dishMapper.fromUpdateDtoToDomain(dto);
    const updatedDish = await this.dishDomainService.updateDish(dishUpdate);

    this.logger.log(`Dish updated ${updatedDish.id}`, 'UpdateDishUseCase');

    return this.dishMapper.fromEntitytoDTO(updatedDish);
  }
}
