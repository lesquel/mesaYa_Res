import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { RestaurantNotFoundError } from '../../domain';
import { FindRestaurantQuery, RestaurantResponseDto } from '../dto';
import { RestaurantMapper } from '../mappers';
import { RESTAURANT_REPOSITORY, type RestaurantRepositoryPort } from '../ports';

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
