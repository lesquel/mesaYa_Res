import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
import type {
  CreateGraphicObjectCommand,
  DeleteGraphicObjectCommand,
  FindGraphicObjectQuery,
  ListGraphicObjectsQuery,
  UpdateGraphicObjectCommand,
  DeleteGraphicObjectResponseDto,
  GraphicObjectResponseDto,
} from '../dto/index.js';
import {
  CreateGraphicObjectUseCase,
  DeleteGraphicObjectUseCase,
  FindGraphicObjectUseCase,
  ListGraphicObjectsUseCase,
  UpdateGraphicObjectUseCase,
} from '../use-cases/index.js';
import type { PaginatedGraphicObjectResponse } from '../use-cases/list-graphic-objects.use-case.js';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly createObject: CreateGraphicObjectUseCase,
    private readonly listObjects: ListGraphicObjectsUseCase,
    private readonly findObject: FindGraphicObjectUseCase,
    private readonly updateObject: UpdateGraphicObjectUseCase,
    private readonly deleteObject: DeleteGraphicObjectUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  @KafkaEmit({
    topic: KAFKA_TOPICS.OBJECT_CREATED,
    payload: ({ result, toPlain }) => ({
      action: 'object.created',
      entity: toPlain(result),
    }),
  })
  async create(
    command: CreateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    return this.createObject.execute(command);
  }

  async list(
    query: ListGraphicObjectsQuery,
  ): Promise<PaginatedGraphicObjectResponse> {
    return this.listObjects.execute(query);
  }

  async findOne(
    query: FindGraphicObjectQuery,
  ): Promise<GraphicObjectResponseDto> {
    return this.findObject.execute(query);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.OBJECT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateGraphicObjectCommand];
      return {
        action: 'object.updated',
        entityId: command.objectId,
        entity: toPlain(result),
      };
    },
  })
  async update(
    command: UpdateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    return this.updateObject.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.OBJECT_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteGraphicObjectCommand];
      return {
        action: 'object.deleted',
        entityId: command.objectId,
        result: toPlain(result),
      };
    },
  })
  async delete(
    command: DeleteGraphicObjectCommand,
  ): Promise<DeleteGraphicObjectResponseDto> {
    return this.deleteObject.execute(command);
  }
}
