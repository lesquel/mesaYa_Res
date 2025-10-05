import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case.js';
import { ListRestaurantsQuery } from '../dto/input/list-restaurants.query.js';
import { PaginatedRestaurantResponse } from '../dto/output/restaurant.response.dto.js';
import { RestaurantMapper } from '../mappers/restaurant.mapper.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

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
