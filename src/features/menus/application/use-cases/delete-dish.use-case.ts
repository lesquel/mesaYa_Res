import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { UseCase } from '@shared/application/ports/use-case.port';
import { DishDomainService } from '@features/menus/domain';
import { DeleteDishDto } from '../dtos/input/delete-dish.dto';
import { DeleteDishResponseDto } from '../dtos/output/delete-dish-response.dto';

export class DeleteDishUseCase
  implements UseCase<DeleteDishDto, DeleteDishResponseDto>
{
  constructor(
    private readonly logger: ILoggerPort,
    private readonly dishDomainService: DishDomainService,
  ) {}

  async execute(dto: DeleteDishDto): Promise<DeleteDishResponseDto> {
    this.logger.log(`Deleting dish ${dto.dishId}`, 'DeleteDishUseCase');

    await this.dishDomainService.deleteDish(dto.dishId);

    this.logger.log(`Dish deleted ${dto.dishId}`, 'DeleteDishUseCase');

    return { dishId: dto.dishId };
  }
}
