import { Injectable } from '@nestjs/common';
import {
  CreateRestaurantCommand,
  DeleteRestaurantCommand,
  FindRestaurantQuery,
  ListOwnerRestaurantsQuery,
  ListRestaurantsQuery,
  UpdateRestaurantCommand,
  PaginatedRestaurantResponse,
  RestaurantResponseDto,
  DeleteRestaurantResponseDto,
} from '../dto/index.js';
import {
  CreateRestaurantUseCase,
  DeleteRestaurantUseCase,
  FindRestaurantUseCase,
  ListOwnerRestaurantsUseCase,
  ListRestaurantsUseCase,
  UpdateRestaurantUseCase,
} from '../use-cases/index.js';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly createRestaurantUseCase: CreateRestaurantUseCase,
    private readonly listRestaurantsUseCase: ListRestaurantsUseCase,
    private readonly listOwnerRestaurantsUseCase: ListOwnerRestaurantsUseCase,
    private readonly findRestaurantUseCase: FindRestaurantUseCase,
    private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
    private readonly deleteRestaurantUseCase: DeleteRestaurantUseCase,
  ) {}

  async create(
    command: CreateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    return this.createRestaurantUseCase.execute(command);
  }

  async list(
    query: ListRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    return this.listRestaurantsUseCase.execute(query);
  }

  async listByOwner(
    query: ListOwnerRestaurantsQuery,
  ): Promise<PaginatedRestaurantResponse> {
    return this.listOwnerRestaurantsUseCase.execute(query);
  }

  async findOne(query: FindRestaurantQuery): Promise<RestaurantResponseDto> {
    return this.findRestaurantUseCase.execute(query);
  }

  async update(
    command: UpdateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    return this.updateRestaurantUseCase.execute(command);
  }

  async delete(
    command: DeleteRestaurantCommand,
  ): Promise<DeleteRestaurantResponseDto> {
    return this.deleteRestaurantUseCase.execute(command);
  }
}
