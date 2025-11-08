import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantDomainService } from '../../domain/services/restaurant-domain.service';
import {
  UpdateRestaurantCommand,
  RestaurantResponseDto,
} from '../dto/index';
import { RestaurantMapper } from '../mappers/index';

export class UpdateRestaurantUseCase
  implements UseCase<UpdateRestaurantCommand, RestaurantResponseDto>
{
  constructor(
    private readonly restaurantDomainService: RestaurantDomainService,
  ) {}

  async execute(
    command: UpdateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantDomainService.updateRestaurant({
      restaurantId: command.restaurantId,
      ownerId: command.ownerId,
      name: command.name,
      description: command.description,
      location: command.location,
      openTime: command.openTime,
      closeTime: command.closeTime,
      daysOpen: command.daysOpen,
      totalCapacity: command.totalCapacity,
      subscriptionId: command.subscriptionId,
      imageId: command.imageId,
    });

    return RestaurantMapper.toResponse(restaurant);
  }
}
