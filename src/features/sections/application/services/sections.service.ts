import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import type { SectionAnalyticsQuery } from '../dto/analytics/section-analytics.query';
import type { SectionAnalyticsResponse } from '../dto/analytics/section-analytics.response';
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
} from '../dto';
import {
  CreateSectionUseCase,
  DeleteSectionUseCase,
  FindSectionUseCase,
  ListRestaurantSectionsUseCase,
  ListSectionsUseCase,
  GetSectionAnalyticsUseCase,
  UpdateSectionUseCase,
} from '../use-cases';
import { SectionsAccessService } from './sections-access.service';
import { SectionForbiddenError } from '../../domain/errors';

export class SectionsService {
  constructor(
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly listSectionsUseCase: ListSectionsUseCase,
    private readonly listRestaurantSectionsUseCase: ListRestaurantSectionsUseCase,
    private readonly findSectionUseCase: FindSectionUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase,
    private readonly deleteSectionUseCase: DeleteSectionUseCase,
    private readonly getSectionAnalyticsUseCase: GetSectionAnalyticsUseCase,
    private readonly accessControl: SectionsAccessService,
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

  async createForOwner(
    command: CreateSectionCommand,
    ownerId: string,
  ): Promise<SectionResponseDto> {
    await this.accessControl.assertRestaurantOwnership(
      command.restaurantId,
      ownerId,
    );
    return this.create(command);
  }

  async findRestaurantIdByOwner(ownerId: string): Promise<string | null> {
    return this.accessControl.findRestaurantIdByOwner(ownerId);
  }

  async list(query: ListSectionsQuery): Promise<PaginatedSectionResponse> {
    return this.listSectionsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.listRestaurantSectionsUseCase.execute(query);
  }

  async listForOwner(
    query: ListSectionsQuery,
    ownerId: string,
  ): Promise<PaginatedSectionResponse> {
    const restaurantIds =
      await this.accessControl.findRestaurantIdsByOwner(ownerId);
      console.log('Owner restaurant IDs:', restaurantIds);

    if (restaurantIds.length === 0) {
      const page = query.pagination?.page ?? 1;
      const limit = query.pagination?.limit ?? 10;
      return {
        results: [],
        total: 0,
        limit,
        page,
        pages: 0,
        offset: 0,
        hasNext: false,
        hasPrev: false,
      };
    }

    // If restaurantId is provided in query, verify ownership
    if (query.restaurantId) {
      console.log(`Verifying ownership for restaurantId: ${query.restaurantId}`);
      if (!restaurantIds.includes(query.restaurantId)) {
        const page = query.pagination?.page ?? 1;
        const limit = query.pagination?.limit ?? 10;
        return {
          results: [],
          total: 0,
          limit,
          page,
          pages: 0,
          offset: 0,
          hasNext: false,
          hasPrev: false,
        };
      }
      // If valid, just use the original query which has restaurantId
      return this.listSectionsUseCase.execute(query);
    }

    // If no specific restaurant requested, filter by all owned restaurants
    return this.listSectionsUseCase.execute({
      ...query,
      restaurantIds,
    });
  }

  async listByRestaurantForOwner(
    query: ListRestaurantSectionsQuery,
    ownerId: string,
  ): Promise<PaginatedSectionResponse> {
    await this.accessControl.assertRestaurantOwnership(
      query.restaurantId,
      ownerId,
    );
    return this.listByRestaurant(query);
  }

  async findOne(query: FindSectionQuery): Promise<SectionResponseDto> {
    return this.findSectionUseCase.execute(query);
  }

  async findOneForOwner(
    query: FindSectionQuery,
    ownerId: string,
  ): Promise<SectionResponseDto> {
    const section = await this.findOne(query);
    await this.accessControl.assertRestaurantOwnership(
      section.restaurantId,
      ownerId,
    );
    return section;
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

  async updateForOwner(
    command: UpdateSectionCommand,
    ownerId: string,
  ): Promise<SectionResponseDto> {
    const ownership = await this.accessControl.assertSectionOwnership(
      command.sectionId,
      ownerId,
    );

    if (
      command.restaurantId &&
      command.restaurantId !== ownership.restaurantId
    ) {
      await this.accessControl.assertRestaurantOwnership(
        command.restaurantId,
        ownerId,
      );
    }

    return this.update(command);
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

  async deleteForOwner(
    command: DeleteSectionCommand,
    ownerId: string,
  ): Promise<DeleteSectionResponseDto> {
    await this.accessControl.assertSectionOwnership(command.sectionId, ownerId);
    return this.delete(command);
  }

  async getAnalytics(
    query: SectionAnalyticsQuery,
  ): Promise<SectionAnalyticsResponse> {
    return this.getSectionAnalyticsUseCase.execute(query);
  }

  async getAnalyticsForOwner(
    query: SectionAnalyticsQuery,
    ownerId: string,
  ): Promise<SectionAnalyticsResponse> {
    if (!query.restaurantId) {
      throw new SectionForbiddenError(
        'Restaurant identifier is required for owner analytics access',
      );
    }

    await this.accessControl.assertRestaurantOwnership(
      query.restaurantId,
      ownerId,
    );

    return this.getAnalytics(query);
  }
}
