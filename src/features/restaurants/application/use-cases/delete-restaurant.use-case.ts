import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { RestaurantNotFoundError } from '../../domain/errors/restaurant-not-found.error.js';
import { RestaurantOwnershipError } from '../../domain/errors/restaurant-ownership.error.js';
import { DeleteRestaurantCommand } from '../dto/input/delete-restaurant.command.js';
import { DeleteRestaurantResponseDto } from '../dto/output/delete-restaurant.response.dto.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

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

    await this.restaurantRepository.delete(command.restaurantId);

    return { ok: true };
  }
}
