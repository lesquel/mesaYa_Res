import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantDomainService } from '../../domain/services/restaurant-domain.service';
import {
  type UpdateRestaurantStatusCommand,
  type RestaurantResponseDto,
} from '../dto/index';
import { RestaurantMapper } from '../mappers/index';

export class UpdateRestaurantStatusUseCase
  implements UseCase<UpdateRestaurantStatusCommand, RestaurantResponseDto>
{
  constructor(
    private readonly restaurantDomainService: RestaurantDomainService,
  ) {}

  async execute(
    command: UpdateRestaurantStatusCommand,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantDomainService.changeStatus({
      restaurantId: command.restaurantId,
      ownerId: command.ownerId,
      status: command.status,
      adminNote: command.adminNote,
    });

    return RestaurantMapper.toResponse(restaurant);
  }
}
