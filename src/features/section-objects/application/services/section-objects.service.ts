import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import type {
  CreateSectionObjectCommand,
  DeleteSectionObjectCommand,
  FindSectionObjectQuery,
  ListSectionObjectsQuery,
  UpdateSectionObjectCommand,
  SectionObjectResponseDto,
  DeleteSectionObjectResponseDto,
} from '../dto';
import {
  CreateSectionObjectUseCase,
  DeleteSectionObjectUseCase,
  FindSectionObjectUseCase,
  ListByObjectUseCase,
  ListBySectionUseCase,
  ListSectionObjectsUseCase,
  UpdateSectionObjectUseCase,
} from '../use-cases';
import type { PaginatedSectionObjectResponse } from '../use-cases/list-section-objects.use-case';

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

  /**
   * Emits `mesa-ya.section-objects.events` with event_type='created'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECTS,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
      };
    },
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

  /**
   * Emits `mesa-ya.section-objects.events` with event_type='updated'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECTS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSectionObjectCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: command.sectionObjectId,
        data: entity,
      };
    },
  })
  async update(
    command: UpdateSectionObjectCommand,
  ): Promise<SectionObjectResponseDto> {
    return this.updateUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.section-objects.events` with event_type='deleted'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_OBJECTS,
    payload: ({ result, toPlain }) => {
      const { sectionObject } = result as DeleteSectionObjectResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: sectionObject.id,
        data: toPlain(sectionObject),
      };
    },
  })
  async delete(
    command: DeleteSectionObjectCommand,
  ): Promise<DeleteSectionObjectResponseDto> {
    return this.deleteUseCase.execute(command);
  }
}
