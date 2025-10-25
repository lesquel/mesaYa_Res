import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import type {
  CreateGraphicObjectCommand,
  DeleteGraphicObjectCommand,
  FindGraphicObjectQuery,
  ListGraphicObjectsQuery,
  UpdateGraphicObjectCommand,
  DeleteGraphicObjectResponseDto,
  GraphicObjectResponseDto,
} from '../dto';
import {
  CreateGraphicObjectUseCase,
  DeleteGraphicObjectUseCase,
  FindGraphicObjectUseCase,
  ListGraphicObjectsUseCase,
  UpdateGraphicObjectUseCase,
} from '../use-cases';
import type { PaginatedGraphicObjectResponse } from '../use-cases/list-graphic-objects.use-case';

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
    payload: ({ result, toPlain }) => {
      const { graphicObject } = result as DeleteGraphicObjectResponseDto;
      return {
        action: 'object.deleted',
        entityId: graphicObject.id,
        entity: toPlain(graphicObject),
      };
    },
  })
  async delete(
    command: DeleteGraphicObjectCommand,
  ): Promise<DeleteGraphicObjectResponseDto> {
    return this.deleteObject.execute(command);
  }
}
