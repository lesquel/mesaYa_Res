import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { type UpdateRestaurantProps } from '../../domain/entities/restaurant.entity.js';
import { RestaurantNotFoundError } from '../../domain/errors/restaurant-not-found.error.js';
import { RestaurantOwnershipError } from '../../domain/errors/restaurant-ownership.error.js';
import { UpdateRestaurantCommand } from '../dto/input/update-restaurant.dto.js';
import { RestaurantResponseDto } from '../dto/output/restaurant.response.dto.js';
import { RestaurantMapper } from '../mappers/restaurant.mapper.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

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

    restaurant.update(partial as UpdateRestaurantProps);
    const saved = await this.restaurantRepository.save(restaurant);

    return RestaurantMapper.toResponse(saved);
  }
}
