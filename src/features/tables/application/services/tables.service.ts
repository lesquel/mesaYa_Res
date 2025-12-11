import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
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
   * Emits `mesa-ya.tables.events` with event_type='created' and returns the created table DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLES,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
      };
    },
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
   * Emits `mesa-ya.tables.events` with event_type='updated' and returns the updated table DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLES,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateTableCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: command.tableId,
        data: entity,
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
   * Emits `mesa-ya.tables.events` with event_type='deleted' and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLES,
    payload: ({ result, toPlain }) => {
      const { table } = result as DeleteTableResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: table.id,
        data: toPlain(table),
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
   * NOTE: This is an ephemeral event - it goes through WebSocket only, NOT Kafka.
   * WebSocket topic: WEBSOCKET_ONLY_EVENTS.TABLE_SELECTING
   *
   * The selection expires after a configurable timeout (default: 5 minutes).
   */
  async selectTable(
    command: SelectTableCommand,
  ): Promise<TableSelectionResponse> {
    // Verify the table exists
    await this.findTable.execute({ tableId: command.tableId });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5-minute hold

    // NOTE: Emit via WebSocket service instead of Kafka for real-time ephemeral events
    // this.websocketService.emit(WEBSOCKET_ONLY_EVENTS.TABLE_SELECTING, { ... });

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
   * NOTE: This is an ephemeral event - it goes through WebSocket only, NOT Kafka.
   * WebSocket topic: WEBSOCKET_ONLY_EVENTS.TABLE_RELEASED
   */
  async releaseTable(
    command: ReleaseTableCommand,
  ): Promise<TableSelectionResponse> {
    // NOTE: Emit via WebSocket service instead of Kafka for real-time ephemeral events
    // this.websocketService.emit(WEBSOCKET_ONLY_EVENTS.TABLE_RELEASED, { ... });

    return {
      tableId: command.tableId,
      sectionId: command.sectionId,
      restaurantId: command.restaurantId,
      status: 'released',
    };
  }
}
