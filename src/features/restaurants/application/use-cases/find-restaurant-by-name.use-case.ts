import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantResponseDto } from '../dto/index';
import { RestaurantMapper } from '../mappers/index';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index';

export interface FindRestaurantByNameQuery {
  name: string;
}

@Injectable()
export class FindRestaurantByNameUseCase
  implements UseCase<FindRestaurantByNameQuery, RestaurantResponseDto | null>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    query: FindRestaurantByNameQuery,
  ): Promise<RestaurantResponseDto | null> {
    const restaurant = await this.restaurantRepository.findByName(query.name);

    if (!restaurant) {
      return null;
    }

    return RestaurantMapper.toResponse(restaurant);
  }
}
