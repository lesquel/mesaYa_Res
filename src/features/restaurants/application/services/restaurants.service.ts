import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka/index';
import type {
  CreateRestaurantCommand,
  DeleteRestaurantCommand,
  FindRestaurantQuery,
  ListOwnerRestaurantsQuery,
  ListRestaurantsQuery,
  ReassignRestaurantOwnerCommand,
  UpdateRestaurantCommand,
  UpdateRestaurantStatusCommand,
  ListNearbyRestaurantsQuery,
  PaginatedRestaurantResponse,
  RestaurantResponseDto,
  DeleteRestaurantResponseDto,
  RestaurantOwnerOptionDto,
} from '../dto/index';
import {
  CreateRestaurantUseCase,
  DeleteRestaurantUseCase,
  FindRestaurantUseCase,
  ListOwnerRestaurantsUseCase,
  ListNearbyRestaurantsUseCase,
  ListRestaurantsUseCase,
  ReassignRestaurantOwnerUseCase,
  UpdateRestaurantUseCase,
  UpdateRestaurantStatusUseCase,
  ListRestaurantOwnersUseCase,
} from '../use-cases/index';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly createRestaurantUseCase: CreateRestaurantUseCase,
    private readonly listRestaurantsUseCase: ListRestaurantsUseCase,
    private readonly listOwnerRestaurantsUseCase: ListOwnerRestaurantsUseCase,
    private readonly findRestaurantUseCase: FindRestaurantUseCase,
    private readonly listNearbyRestaurantsUseCase: ListNearbyRestaurantsUseCase,
    private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
    private readonly updateRestaurantStatusUseCase: UpdateRestaurantStatusUseCase,
    private readonly deleteRestaurantUseCase: DeleteRestaurantUseCase,
    private readonly listRestaurantOwnersUseCase: ListRestaurantOwnersUseCase,
    private readonly reassignRestaurantOwnerUseCase: ReassignRestaurantOwnerUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  async listNearby(
    query: ListNearbyRestaurantsQuery,
  ): Promise<RestaurantResponseDto[]> {
    return this.listNearbyRestaurantsUseCase.execute(query);
  }

  /**
   * Emits `mesa-ya.restaurants.created` with `{ action, entity, performedBy }` and returns the created restaurant DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANT_CREATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateRestaurantCommand];
      return {
        action: 'restaurant.created',
        entity: toPlain(result),
        performedBy: command.ownerId,
      };
    },
  })
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

  async listOwners(): Promise<RestaurantOwnerOptionDto[]> {
    return this.listRestaurantOwnersUseCase.execute();
  }

  async findOne(query: FindRestaurantQuery): Promise<RestaurantResponseDto> {
    return this.findRestaurantUseCase.execute(query);
  }

  /**
   * Emits `mesa-ya.restaurants.updated` with `{ action, entity, performedBy }` and returns the updated restaurant DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRestaurantCommand];
      return {
        action: 'restaurant.updated',
        entity: toPlain(result),
        performedBy: command.ownerId,
      };
    },
  })
  async update(
    command: UpdateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    return this.updateRestaurantUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [ReassignRestaurantOwnerCommand];
      return {
        action: 'restaurant.owner.reassigned',
        entity: toPlain(result),
        performedBy: command.ownerId,
      };
    },
  })
  async reassignOwner(
    command: ReassignRestaurantOwnerCommand,
  ): Promise<RestaurantResponseDto> {
    return this.reassignRestaurantOwnerUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRestaurantStatusCommand];
      return {
        action: 'restaurant.status.updated',
        entity: toPlain(result),
        performedBy: command.ownerId,
      };
    },
  })
  async updateStatus(
    command: UpdateRestaurantStatusCommand,
  ): Promise<RestaurantResponseDto> {
    return this.updateRestaurantStatusUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.restaurants.deleted` with `{ action, entityId, entity, performedBy }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANT_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteRestaurantCommand];
      const { restaurant } = result as DeleteRestaurantResponseDto;
      return {
        action: 'restaurant.deleted',
        entityId: restaurant.id,
        performedBy: command.ownerId,
        entity: toPlain(restaurant),
      };
    },
  })
  async delete(
    command: DeleteRestaurantCommand,
  ): Promise<DeleteRestaurantResponseDto> {
    return this.deleteRestaurantUseCase.execute(command);
  }
}
