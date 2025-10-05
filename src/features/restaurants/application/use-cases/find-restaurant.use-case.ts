import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { RestaurantNotFoundError } from '../../domain/errors/restaurant-not-found.error.js';
import { FindRestaurantQuery } from '../dto/input/find-restaurant.query.js';
import { RestaurantResponseDto } from '../dto/output/restaurant.response.dto.js';
import { RestaurantMapper } from '../mappers/restaurant.mapper.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

@Injectable()
export class FindRestaurantUseCase
  implements UseCase<FindRestaurantQuery, RestaurantResponseDto>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(query: FindRestaurantQuery): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findById(
      query.restaurantId,
    );

    if (!restaurant) {
      throw new RestaurantNotFoundError(query.restaurantId);
    }

    return RestaurantMapper.toResponse(restaurant);
  }
}
