import { Table } from '../../domain/entities/table.entity.js';
import { ListTablesQuery } from '../dto/input/list-tables.query.js';
import { ListSectionTablesQuery } from '../dto/input/list-section-tables.query.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';

export const TABLE_REPOSITORY = Symbol('TABLE_REPOSITORY');

export interface TableRepositoryPort {
  save(table: Table): Promise<Table>;
  findById(id: string): Promise<Table | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListTablesQuery): Promise<PaginatedResult<Table>>;
  paginateBySection(
    query: ListSectionTablesQuery,
  ): Promise<PaginatedResult<Table>>;
}
