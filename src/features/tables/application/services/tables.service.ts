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

  async list(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    return this.listTables.execute(query);
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

    if (
      command.sectionId &&
      command.sectionId !== ownership.sectionId
    ) {
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
}
