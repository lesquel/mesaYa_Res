import { Injectable } from '@nestjs/common';
import {
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
  ) {}

  create(command: CreateTableCommand): Promise<TableResponseDto> {
    return this.createTable.execute(command);
  }
  list(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    return this.listTables.execute(query);
  }
  listSection(query: ListSectionTablesQuery): Promise<PaginatedTableResponse> {
    return this.listBySection.execute(query);
  }
  findOne(query: FindTableQuery): Promise<TableResponseDto> {
    return this.findTable.execute(query);
  }
  update(command: UpdateTableCommand): Promise<TableResponseDto> {
    return this.updateTable.execute(command);
  }
  delete(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    return this.deleteTable.execute(command);
  }
}
