import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
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
} from '../dto/index.js';
import {
  CreateSectionUseCase,
  DeleteSectionUseCase,
  FindSectionUseCase,
  ListRestaurantSectionsUseCase,
  ListSectionsUseCase,
  UpdateSectionUseCase,
} from '../use-cases/index.js';

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

  @KafkaEmit({
    topic: KAFKA_TOPICS.SECTION_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteSectionCommand];
      return {
        action: 'section.deleted',
        entityId: command.sectionId,
        result: toPlain(result),
      };
    },
  })
  async delete(
    command: DeleteSectionCommand,
  ): Promise<DeleteSectionResponseDto> {
    return this.deleteSectionUseCase.execute(command);
  }
}
