import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantDomainService } from '../../domain/services/restaurant-domain.service';
import { ReassignRestaurantOwnerCommand, RestaurantResponseDto } from '../dto/index';
import { RestaurantMapper } from '../mappers/index';

export class ReassignRestaurantOwnerUseCase
  implements UseCase<ReassignRestaurantOwnerCommand, RestaurantResponseDto>
{
  constructor(private readonly restaurantDomainService: RestaurantDomainService) {}

  async execute(
    command: ReassignRestaurantOwnerCommand,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantDomainService.reassignOwner({
      restaurantId: command.restaurantId,
      ownerId: command.ownerId,
      enforceOwnership: command.enforceOwnership,
    });

    return RestaurantMapper.toResponse(restaurant);
  }
}
