import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  type RestaurantUpdate,
  RestaurantNotFoundError,
  RestaurantOwnershipError,
} from '../../domain/index.js';
import {
  UpdateRestaurantCommand,
  RestaurantResponseDto,
} from '../dto/index.js';
import { RestaurantMapper } from '../mappers/index.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class UpdateRestaurantUseCase
  implements UseCase<UpdateRestaurantCommand, RestaurantResponseDto>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    command: UpdateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    const { restaurantId, ownerId, ...partial } = command;

    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError(restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new RestaurantOwnershipError();
    }

    restaurant.update(partial as RestaurantUpdate);
    const saved = await this.restaurantRepository.save(restaurant);

    return RestaurantMapper.toResponse(saved);
  }
}
