import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantDomainService } from '../../domain/services/restaurant-domain.service';
import { DeleteRestaurantCommand, DeleteRestaurantResponseDto } from '../dto';
import { RestaurantMapper } from '../mappers';

export class DeleteRestaurantUseCase
  implements UseCase<DeleteRestaurantCommand, DeleteRestaurantResponseDto>
{
  constructor(
    private readonly restaurantDomainService: RestaurantDomainService,
  ) {}

  async execute(
    command: DeleteRestaurantCommand,
  ): Promise<DeleteRestaurantResponseDto> {
    const restaurant = await this.restaurantDomainService.deleteRestaurant({
      restaurantId: command.restaurantId,
      ownerId: command.ownerId,
    });

    return {
      ok: true,
      restaurant: RestaurantMapper.toResponse(restaurant),
    };
  }
}
