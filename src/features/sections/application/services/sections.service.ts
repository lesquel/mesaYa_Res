import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka/index';
import type {
  CreateSectionCommand,
  DeleteSectionCommand,
  DeleteSectionResponseDto,
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  PaginatedSectionResponse,
  SectionResponseDto,
  UpdateSectionCommand,
} from '../dto/index';
import {
  CreateSectionUseCase,
  DeleteSectionUseCase,
  FindSectionUseCase,
  ListRestaurantSectionsUseCase,
  ListSectionsUseCase,
  UpdateSectionUseCase,
} from '../use-cases/index';

export class SectionsService {
  constructor(
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly listSectionsUseCase: ListSectionsUseCase,
    private readonly listRestaurantSectionsUseCase: ListRestaurantSectionsUseCase,
    private readonly findSectionUseCase: FindSectionUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase,
    private readonly deleteSectionUseCase: DeleteSectionUseCase,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Emits `mesa-ya.sections.created` with `{ action, entity }` and returns the created section DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_CREATED,
    payload: ({ result, toPlain }) => ({
      action: 'section.created',
      entity: toPlain(result),
    }),
  })
  async create(command: CreateSectionCommand): Promise<SectionResponseDto> {
    return this.createSectionUseCase.execute(command);
  }

  async list(query: ListSectionsQuery): Promise<PaginatedSectionResponse> {
    return this.listSectionsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.listRestaurantSectionsUseCase.execute(query);
  }

  async findOne(query: FindSectionQuery): Promise<SectionResponseDto> {
    return this.findSectionUseCase.execute(query);
  }

  /**
   * Emits `mesa-ya.sections.updated` with `{ action, entity }` and returns the updated section DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_UPDATED,
    payload: ({ result, toPlain }) => ({
      action: 'section.updated',
      entity: toPlain(result),
    }),
  })
  async update(command: UpdateSectionCommand): Promise<SectionResponseDto> {
    return this.updateSectionUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.sections.deleted` with `{ action, entityId, entity }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_DELETED,
    payload: ({ result, toPlain }) => {
      const { section } = result as DeleteSectionResponseDto;
      return {
        action: 'section.deleted',
        entityId: section.id,
        entity: toPlain(section),
      };
    },
  })
  async delete(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    return this.deleteSectionUseCase.execute(command);
  }
}
