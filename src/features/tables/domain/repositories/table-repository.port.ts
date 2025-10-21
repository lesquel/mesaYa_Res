import { Table } from '../entities/table.entity';

export abstract class ITableDomainRepositoryPort {
  abstract save(table: Table): Promise<Table>;
  abstract findById(tableId: string): Promise<Table | null>;
  abstract delete(tableId: string): Promise<void>;
  abstract findBySectionAndNumber(
    sectionId: string,
    number: number,
  ): Promise<Table | null>;
  abstract listBySection(sectionId: string): Promise<Table[]>;
}
