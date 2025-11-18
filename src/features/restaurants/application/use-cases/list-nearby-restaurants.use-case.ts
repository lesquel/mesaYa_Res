import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ListNearbyRestaurantsQuery, RestaurantResponseDto } from '../dto';
import { RestaurantMapper } from '../mappers';
import { RESTAURANT_REPOSITORY, RestaurantRepositoryPort } from '../ports';

@Injectable()
export class ListNearbyRestaurantsUseCase
  implements UseCase<ListNearbyRestaurantsQuery, RestaurantResponseDto[]>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    query: ListNearbyRestaurantsQuery,
  ): Promise<RestaurantResponseDto[]> {
    const matches = await this.restaurantRepository.findNearby(query);
    return matches.map(({ restaurant, distanceKm }) =>
      RestaurantMapper.toResponse(restaurant, {
        distanceKm: distanceKm ?? undefined,
      }),
    );
  }
}
