import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { RestaurantNotFoundError } from '../../domain/index.js';
import { FindRestaurantQuery, RestaurantResponseDto } from '../dto/index.js';
import { RestaurantMapper } from '../mappers/index.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index.js';

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
