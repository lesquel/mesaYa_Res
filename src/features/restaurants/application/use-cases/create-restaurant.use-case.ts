import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { Restaurant } from '../../domain/entities/restaurant.entity.js';
import { RestaurantOwnerNotFoundError } from '../../domain/errors/restaurant-owner-not-found.error.js';
import { RestaurantMapper } from '../mappers/restaurant.mapper.js';
import { RestaurantResponseDto } from '../dto/output/restaurant.response.dto.js';
import { CreateRestaurantCommand } from '../dto/input/create-restaurant.dto.js';
import {
  OWNER_READER,
  type OwnerReaderPort,
} from '../ports/owner-reader.port.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

@Injectable()
export class CreateRestaurantUseCase
  implements UseCase<CreateRestaurantCommand, RestaurantResponseDto>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    @Inject(OWNER_READER)
    private readonly ownerReader: OwnerReaderPort,
  ) {}

  async execute(
    command: CreateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    const ownerExists = await this.ownerReader.exists(command.ownerId);
    if (!ownerExists) {
      throw new RestaurantOwnerNotFoundError(command.ownerId);
    }

    const restaurant = Restaurant.create({ ...command });
    const saved = await this.restaurantRepository.save(restaurant);

    return RestaurantMapper.toResponse(saved);
  }
}
