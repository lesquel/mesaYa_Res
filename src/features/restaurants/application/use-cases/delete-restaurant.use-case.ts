import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  RestaurantNotFoundError,
  RestaurantOwnershipError,
} from '../../domain/index';
import {
  DeleteRestaurantCommand,
  DeleteRestaurantResponseDto,
} from '../dto/index';
import { RestaurantMapper } from '../mappers/index';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index';

@Injectable()
export class DeleteRestaurantUseCase
  implements UseCase<DeleteRestaurantCommand, DeleteRestaurantResponseDto>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    command: DeleteRestaurantCommand,
  ): Promise<DeleteRestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findById(
      command.restaurantId,
    );
    if (!restaurant) {
      throw new RestaurantNotFoundError(command.restaurantId);
    }

    if (restaurant.ownerId !== command.ownerId) {
      throw new RestaurantOwnershipError();
    }

    const restaurantResponse = RestaurantMapper.toResponse(restaurant);

    await this.restaurantRepository.delete(command.restaurantId);

    return { ok: true, restaurant: restaurantResponse };
  }
}
