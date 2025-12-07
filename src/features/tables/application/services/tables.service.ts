import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import type { TableAnalyticsQuery } from '../dto/analytics/table-analytics.query';
import type { TableAnalyticsResponse } from '../dto/analytics/table-analytics.response';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  FindTableQuery,
  ListTablesQuery,
  ListSectionTablesQuery,
  TableResponseDto,
  DeleteTableResponseDto,
  PaginatedTableResponse,
  UpdateTableCommand,
  SelectTableCommand,
  ReleaseTableCommand,
} from '../dto';
import {
  CreateTableUseCase,
  DeleteTableUseCase,
  FindTableUseCase,
  ListTablesUseCase,
  ListSectionTablesUseCase,
  UpdateTableUseCase,
  GetTableAnalyticsUseCase,
} from '../use-cases';
import { TablesAccessService } from './tables-access.service';
import { TableForbiddenError } from '../../domain/errors';

/** Response for table selection operations */
export interface TableSelectionResponse {
  tableId: string;
  sectionId: string;
  restaurantId: string;
  status: 'selecting' | 'released';
  selectedBy?: string;
  expiresAt?: Date;
}

@Injectable()
export class TablesService {
  constructor(
    private readonly createTable: CreateTableUseCase,
    private readonly listTables: ListTablesUseCase,
    private readonly listBySection: ListSectionTablesUseCase,
    private readonly findTable: FindTableUseCase,
    private readonly updateTable: UpdateTableUseCase,
    private readonly deleteTable: DeleteTableUseCase,
    private readonly getTableAnalyticsUseCase: GetTableAnalyticsUseCase,
    private readonly accessControl: TablesAccessService,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  /**
   * Emits `mesa-ya.tables.created` with `{ action, entity }` and returns the created table DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_CREATED,
    payload: ({ result, toPlain }) => ({
      action: 'table.created',
      entity: toPlain(result),
    }),
  })
  async create(command: CreateTableCommand): Promise<TableResponseDto> {
    return this.createTable.execute(command);
  }

  async createForOwner(
    command: CreateTableCommand,
    ownerId: string,
  ): Promise<TableResponseDto> {
    await this.accessControl.assertSectionOwnership(command.sectionId, ownerId);
    return this.create(command);
  }

  async findRestaurantIdByOwner(ownerId: string): Promise<string | null> {
    return this.accessControl.findRestaurantIdByOwner(ownerId);
  }

  async list(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    return this.listTables.execute(query);
  }

  async listForOwner(
    query: ListTablesQuery,
    ownerId: string,
  ): Promise<PaginatedTableResponse> {
    const restaurantIds =
      await this.accessControl.findRestaurantIdsByOwner(ownerId);

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
      return this.listTables.execute(query);
    }

    // If no specific restaurant requested, filter by all owned restaurants
    return this.listTables.execute({
      ...query,
      restaurantIds,
    });
  }

  async listSection(
    query: ListSectionTablesQuery,
  ): Promise<PaginatedTableResponse> {
    return this.listBySection.execute(query);
  }

  async listSectionForOwner(
    query: ListSectionTablesQuery,
    ownerId: string,
  ): Promise<PaginatedTableResponse> {
    await this.accessControl.assertSectionOwnership(query.sectionId, ownerId);
    return this.listSection(query);
  }

  async findOne(query: FindTableQuery): Promise<TableResponseDto> {
    return this.findTable.execute(query);
  }

  async findOneForOwner(
    query: FindTableQuery,
    ownerId: string,
  ): Promise<TableResponseDto> {
    const table = await this.findOne(query);
    await this.accessControl.assertTableOwnership(table.id, ownerId);
    return table;
  }

  /**
   * Emits `mesa-ya.tables.updated` with `{ action, entityId, entity }` and returns the updated table DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateTableCommand];
      return {
        action: 'table.updated',
        entityId: command.tableId,
        entity: toPlain(result),
      };
    },
  })
  async update(command: UpdateTableCommand): Promise<TableResponseDto> {
    return this.updateTable.execute(command);
  }

  async updateForOwner(
    command: UpdateTableCommand,
    ownerId: string,
  ): Promise<TableResponseDto> {
    const ownership = await this.accessControl.assertTableOwnership(
      command.tableId,
      ownerId,
    );

    if (command.sectionId && command.sectionId !== ownership.sectionId) {
      await this.accessControl.assertSectionOwnership(
        command.sectionId,
        ownerId,
      );
    }

    return this.update(command);
  }

  /**
   * Emits `mesa-ya.tables.deleted` with `{ action, entityId, entity }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_DELETED,
    payload: ({ result, toPlain }) => {
      const { table } = result as DeleteTableResponseDto;
      return {
        action: 'table.deleted',
        entityId: table.id,
        entity: toPlain(table),
      };
    },
  })
  async delete(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    return this.deleteTable.execute(command);
  }

  async deleteForOwner(
    command: DeleteTableCommand,
    ownerId: string,
  ): Promise<DeleteTableResponseDto> {
    await this.accessControl.assertTableOwnership(command.tableId, ownerId);
    return this.delete(command);
  }

  async getAnalytics(
    query: TableAnalyticsQuery,
  ): Promise<TableAnalyticsResponse> {
    return this.getTableAnalyticsUseCase.execute(query);
  }

  async getAnalyticsForOwner(
    query: TableAnalyticsQuery,
    ownerId: string,
  ): Promise<TableAnalyticsResponse> {
    if (query.sectionId) {
      await this.accessControl.assertSectionOwnership(query.sectionId, ownerId);
      return this.getAnalytics(query);
    }

    if (query.restaurantId) {
      await this.accessControl.assertRestaurantOwnership(
        query.restaurantId,
        ownerId,
      );
      return this.getAnalytics(query);
    }

    throw new TableForbiddenError(
      'Owners must provide sectionId or restaurantId to access analytics',
    );
  }

  /**
   * Temporarily selects a table during the reservation process.
   * Emits `mesa-ya.tables.selecting` to notify other clients that this table
   * is being selected by a user, preventing race conditions.
   *
   * The selection expires after a configurable timeout (default: 5 minutes).
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_SELECTING,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [SelectTableCommand];
      return {
        entity: 'tables',
        action: 'selecting',
        resourceId: command.tableId,
        data: toPlain(result),
        metadata: {
          sectionId: command.sectionId,
          restaurantId: command.restaurantId,
          userId: command.userId,
        },
      };
    },
  })
  async selectTable(command: SelectTableCommand): Promise<TableSelectionResponse> {
    // Verify the table exists
    await this.findTable.execute({ tableId: command.tableId });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5-minute hold

    return {
      tableId: command.tableId,
      sectionId: command.sectionId,
      restaurantId: command.restaurantId,
      status: 'selecting',
      selectedBy: command.userId,
      expiresAt,
    };
  }

  /**
   * Releases a temporarily selected table.
   * Emits `mesa-ya.tables.released` to notify other clients that the table
   * is available again.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_RELEASED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [ReleaseTableCommand];
      return {
        entity: 'tables',
        action: 'released',
        resourceId: command.tableId,
        data: toPlain(result),
        metadata: {
          sectionId: command.sectionId,
          restaurantId: command.restaurantId,
          userId: command.userId,
        },
      };
    },
  })
  async releaseTable(command: ReleaseTableCommand): Promise<TableSelectionResponse> {
    return {
      tableId: command.tableId,
      sectionId: command.sectionId,
      restaurantId: command.restaurantId,
      status: 'released',
    };
  }
}
