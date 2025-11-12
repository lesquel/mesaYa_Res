import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { RESTAURANT_REPOSITORY } from '../ports';
import type { RestaurantRepositoryPort } from '../ports';
import type { RestaurantOwnerOptionDto } from '../dto';

@Injectable()
export class ListRestaurantOwnersUseCase
  implements UseCase<void, RestaurantOwnerOptionDto[]>
{
  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly repository: RestaurantRepositoryPort,
  ) {}

  async execute(): Promise<RestaurantOwnerOptionDto[]> {
    return this.repository.listOwners();
  }
}
