import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantNotFoundError } from '../../domain/index';
import { FindRestaurantQuery, RestaurantResponseDto } from '../dto/index';
import { RestaurantMapper } from '../mappers/index';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index';

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
