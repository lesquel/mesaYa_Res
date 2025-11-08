import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ListRestaurantsQuery,
  PaginatedRestaurantResponse,
} from '../dto/index';
import { RestaurantMapper } from '../mappers/index';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index';

@Injectable()
export class ListRestaurantsUseCase
  implements UseCase<ListRestaurantsQuery, PaginatedRestaurantResponse>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    const result = await this.restaurantRepository.paginate(query);

    return {
      ...result,
      results: result.results.map((restaurant) =>
        RestaurantMapper.toResponse(restaurant),
      ),
    };
  }
}
