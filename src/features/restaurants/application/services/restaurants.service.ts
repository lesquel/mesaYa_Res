import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
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
   * Emits `mesa-ya.restaurants.events` with event_type='created' and returns the created restaurant DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateRestaurantCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.ownerId },
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
   * Emits `mesa-ya.restaurants.events` with event_type='updated' and returns the updated restaurant DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRestaurantCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.ownerId },
      };
    },
  })
  async update(
    command: UpdateRestaurantCommand,
  ): Promise<RestaurantResponseDto> {
    return this.updateRestaurantUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [ReassignRestaurantOwnerCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.ownerId, action: 'owner_reassigned' },
      };
    },
  })
  async reassignOwner(
    command: ReassignRestaurantOwnerCommand,
  ): Promise<RestaurantResponseDto> {
    return this.reassignRestaurantOwnerUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateRestaurantStatusCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.STATUS_CHANGED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.ownerId },
      };
    },
  })
  async updateStatus(
    command: UpdateRestaurantStatusCommand,
  ): Promise<RestaurantResponseDto> {
    return this.updateRestaurantStatusUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.restaurants.events` with event_type='deleted' and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESTAURANTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteRestaurantCommand];
      const { restaurant } = result as DeleteRestaurantResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: restaurant.id,
        data: toPlain(restaurant),
        metadata: { user_id: command.ownerId },
      };
    },
  })
  async delete(
    command: DeleteRestaurantCommand,
  ): Promise<DeleteRestaurantResponseDto> {
    return this.deleteRestaurantUseCase.execute(command);
  }
}
