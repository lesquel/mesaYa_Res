import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/interfaces/use-case.js';
import {
  RestaurantNotFoundError,
  RestaurantOwnershipError,
} from '../../domain/index.js';
import {
  DeleteRestaurantCommand,
  DeleteRestaurantResponseDto,
} from '../dto/index.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index.js';

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
