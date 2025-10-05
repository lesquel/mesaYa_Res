import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import {
  ListRestaurantsQuery,
  PaginatedRestaurantResponse,
} from '../dto/index.js';
import { RestaurantMapper } from '../mappers/index.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/index.js';

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
