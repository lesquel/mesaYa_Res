import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
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
} from '../dto/index.js';
import {
  CreateTableUseCase,
  DeleteTableUseCase,
  FindTableUseCase,
  ListTablesUseCase,
  ListSectionTablesUseCase,
  UpdateTableUseCase,
} from '../use-cases/index.js';

@Injectable()
export class TablesService {
  constructor(
    private readonly createTable: CreateTableUseCase,
    private readonly listTables: ListTablesUseCase,
    private readonly listBySection: ListSectionTablesUseCase,
    private readonly findTable: FindTableUseCase,
    private readonly updateTable: UpdateTableUseCase,
    private readonly deleteTable: DeleteTableUseCase,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

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

  async list(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    return this.listTables.execute(query);
  }

  async listSection(
    query: ListSectionTablesQuery,
  ): Promise<PaginatedTableResponse> {
    return this.listBySection.execute(query);
  }

  async findOne(query: FindTableQuery): Promise<TableResponseDto> {
    return this.findTable.execute(query);
  }

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

  @KafkaEmit({
    topic: KAFKA_TOPICS.TABLE_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteTableCommand];
      return {
        action: 'table.deleted',
        entityId: command.tableId,
        result: toPlain(result),
      };
    },
  })
  async delete(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    return this.deleteTable.execute(command);
  }
}
