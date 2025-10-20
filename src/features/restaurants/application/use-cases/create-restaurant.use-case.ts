import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  RestaurantEntity,
  RestaurantOwnerNotFoundError,
} from '../../domain/index';
import { RestaurantMapper } from '../mappers/index';
import { RestaurantResponseDto, CreateRestaurantCommand } from '../dto/index';
import {
  OWNER_READER,
  RESTAURANT_REPOSITORY,
  type OwnerReaderPort,
  type RestaurantRepositoryPort,
} from '../ports/index';

@Injectable()
export class CreateRestaurantUseCase
  implements UseCase<CreateRestaurantCommand, RestaurantResponseDto>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    @Inject(OWNER_READER)
    private readonly ownerReader: OwnerReaderPort,
  ) {}

  async execute(
    command: CreateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    const ownerExists = await this.ownerReader.exists(command.ownerId);
    if (!ownerExists) {
      throw new RestaurantOwnerNotFoundError(command.ownerId);
    }

    const restaurant = RestaurantEntity.create({ ...command });
    const saved = await this.restaurantRepository.save(restaurant);

    return RestaurantMapper.toResponse(saved);
  }
}
