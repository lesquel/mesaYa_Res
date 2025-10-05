import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { ListOwnerRestaurantsQuery } from '../dto/input/list-owner-restaurants.query.js';
import { PaginatedRestaurantResponse } from '../dto/output/restaurant.response.dto.js';
import { RestaurantMapper } from '../mappers/restaurant.mapper.js';
import {
  RESTAURANT_REPOSITORY,
  type RestaurantRepositoryPort,
} from '../ports/restaurant-repository.port.js';

@Injectable()
export class ListOwnerRestaurantsUseCase
  implements UseCase<ListOwnerRestaurantsQuery, PaginatedRestaurantResponse>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
  ) {}

  async execute(
    query: ListOwnerRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    const result = await this.restaurantRepository.paginateByOwner(
      query.ownerId,
      query,
    );

    return {
      ...result,
      results: result.results.map((restaurant) =>
        RestaurantMapper.toResponse(restaurant),
      ),
    };
  }
}
