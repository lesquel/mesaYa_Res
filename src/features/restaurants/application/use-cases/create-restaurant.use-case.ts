import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantDomainService } from '../../domain/services/restaurant-domain.service.js';
import { RestaurantMapper } from '../mappers/index.js';
import { RestaurantResponseDto, CreateRestaurantCommand } from '../dto/index.js';

export class CreateRestaurantUseCase
  implements UseCase<CreateRestaurantCommand, RestaurantResponseDto>
{
  constructor(
    private readonly restaurantDomainService: RestaurantDomainService,
  ) {}

  async execute(
    command: CreateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantDomainService.createRestaurant({
      ownerId: command.ownerId,
      name: command.name,
      description: command.description ?? null,
      location: command.location,
      openTime: command.openTime,
      closeTime: command.closeTime,
      daysOpen: command.daysOpen,
      totalCapacity: command.totalCapacity,
      subscriptionId: command.subscriptionId,
      imageId: command.imageId ?? null,
    });

    return RestaurantMapper.toResponse(restaurant);
  }
}
