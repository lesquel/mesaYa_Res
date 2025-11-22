import { TableDomainService } from './table-domain.service';
import { type ITableDomainRepositoryPort } from '../repositories/table-repository.port';
import { Table } from '../entities/table.entity';
import {
  type ITableSectionPort,
  type TableSectionSnapshot,
} from '../ports/table-section.port';

class InMemoryTableRepository implements ITableDomainRepositoryPort {
  private readonly tables = new Map<string, Table>();

  async save(table: Table): Promise<Table> {
    this.tables.set(table.id, table);
    return table;
  }

  async findById(id: string): Promise<Table | null> {
    return this.tables.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.tables.delete(id);
  }

  async findBySectionAndNumber(
    sectionId: string,
    number: number,
  ): Promise<Table | null> {
    return (
      [...this.tables.values()].find(
        (table) => table.sectionId === sectionId && table.number === number,
      ) ?? null
    );
  }

  async listBySection(sectionId: string): Promise<Table[]> {
    return [...this.tables.values()].filter(
      (table) => table.sectionId === sectionId,
    );
  }
}

describe('TableDomainService', () => {
  it('accepts rectangular tables that fit inside the section', async () => {
    const section: TableSectionSnapshot = {
      sectionId: 'section-1',
      restaurantId: 'restaurant-1',
      width: 300,
      height: 200,
    };

    const sectionPort: ITableSectionPort = {
      loadById: jest.fn(async (id: string) =>
        id === section.sectionId ? section : null,
      ),
    };

    const service = new TableDomainService(
      new InMemoryTableRepository(),
      sectionPort,
    );

    const created = await service.createTable({
      tableId: 'table-rect',
      sectionId: section.sectionId,
      number: 42,
      capacity: 4,
      posX: 50,
      posY: 160,
      width: 140,
      height: 30,
      tableImageId: 'table-img',
      chairImageId: 'chair-img',
    });

    const snapshot = created.snapshot();

    expect(snapshot.height).toBe(30);
    expect(snapshot.posY + snapshot.height).toBeLessThanOrEqual(section.height);
    expect(sectionPort.loadById).toHaveBeenCalledWith(section.sectionId);
  });
});
