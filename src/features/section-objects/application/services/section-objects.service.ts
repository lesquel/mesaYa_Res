import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
import type {
  CreateSectionObjectCommand,
  DeleteSectionObjectCommand,
  FindSectionObjectQuery,
  ListSectionObjectsQuery,
  UpdateSectionObjectCommand,
  SectionObjectResponseDto,
  DeleteSectionObjectResponseDto,
} from '../dto/index.js';
import {
  CreateSectionObjectUseCase,
  DeleteSectionObjectUseCase,
  FindSectionObjectUseCase,
  ListByObjectUseCase,
  ListBySectionUseCase,
  ListSectionObjectsUseCase,
  UpdateSectionObjectUseCase,
} from '../use-cases/index.js';
import type { PaginatedSectionObjectResponse } from '../use-cases/list-section-objects.use-case.js';

@Injectable()
export class SectionObjectsService {
  constructor(
    private readonly createUseCase: CreateSectionObjectUseCase,
    private readonly listUseCase: ListSectionObjectsUseCase,
    private readonly listBySectionUseCase: ListBySectionUseCase,
    private readonly listByObjectUseCase: ListByObjectUseCase,
    private readonly findUseCase: FindSectionObjectUseCase,
    private readonly updateUseCase: UpdateSectionObjectUseCase,
    private readonly deleteUseCase: DeleteSectionObjectUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECT_CREATED,
    payload: ({ result, toPlain }) => ({
      action: 'section-object.created',
      entity: toPlain(result),
    }),
  })
  async create(
    command: CreateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    return this.createUseCase.execute(command);
  }

  async list(
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    return this.listUseCase.execute(query);
  }

  async listBySection(
    sectionId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    return this.listBySectionUseCase.execute({ sectionId, ...query });
  }

  async listByObject(
    objectId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    return this.listByObjectUseCase.execute({ objectId, ...query });
  }

  async findOne(
    query: FindSectionObjectQuery,
  ): Promise<SectionObjectResponseDto> {
    return this.findUseCase.execute(query);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECT_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSectionObjectCommand];
      return {
        action: 'section-object.updated',
        entityId: command.sectionObjectId,
        entity: toPlain(result),
      };
    },
  })
  async update(
    command: UpdateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    return this.updateUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECT_DELETED,
    payload: ({ result, toPlain }) => {
      const { sectionObject } = result as DeleteSectionObjectResponseDto;
      return {
        action: 'section-object.deleted',
        entityId: sectionObject.id,
        entity: toPlain(sectionObject),
      };
    },
  })
  async delete(
    command: DeleteSectionObjectCommand,
  ): Promise<DeleteSectionObjectResponseDto> {
    return this.deleteUseCase.execute(command);
  }
}
