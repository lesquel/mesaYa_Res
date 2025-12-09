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
  let repository: InMemoryTableRepository;
  let sectionPort: ITableSectionPort;
  let service: TableDomainService;

  const section: TableSectionSnapshot = {
    sectionId: 'section-1',
    restaurantId: 'restaurant-1',
    width: 300,
    height: 200,
  };

  beforeEach(() => {
    repository = new InMemoryTableRepository();
    sectionPort = {
      loadById: jest.fn(async (id: string) =>
        id === section.sectionId ? section : null,
      ),
    };
    service = new TableDomainService(repository, sectionPort);
  });

  describe('createTable', () => {
    it('accepts rectangular tables that fit inside the section', async () => {
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
      expect(snapshot.posY + snapshot.height).toBeLessThanOrEqual(
        section.height,
      );
      expect(sectionPort.loadById).toHaveBeenCalledWith(section.sectionId);
    });

    it('creates a table with correct properties', async () => {
      const created = await service.createTable({
        tableId: 'table-1',
        sectionId: section.sectionId,
        number: 1,
        capacity: 6,
        posX: 10,
        posY: 10,
        width: 100,
        height: 100,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      expect(created.id).toBe('table-1');
      expect(created.number).toBe(1);
      expect(created.capacity).toBe(6);
      expect(created.posX).toBe(10);
      expect(created.posY).toBe(10);
    });

    it('saves table to repository', async () => {
      const created = await service.createTable({
        tableId: 'table-2',
        sectionId: section.sectionId,
        number: 2,
        capacity: 4,
        posX: 20,
        posY: 20,
        width: 80,
        height: 80,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      const found = await repository.findById('table-2');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('defaults height to width if not provided', async () => {
      const created = await service.createTable({
        tableId: 'table-3',
        sectionId: section.sectionId,
        number: 3,
        capacity: 4,
        posX: 50,
        posY: 50,
        width: 120,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      expect(created.height).toBe(120);
    });
  });

  describe('updateTable', () => {
    it('updates existing table properties', async () => {
      await service.createTable({
        tableId: 'table-update',
        sectionId: section.sectionId,
        number: 10,
        capacity: 4,
        posX: 30,
        posY: 30,
        width: 90,
        height: 90,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      const updated = await service.updateTable({
        tableId: 'table-update',
        capacity: 8,
      });

      expect(updated.capacity).toBe(8);
    });

    it('updates table position', async () => {
      await service.createTable({
        tableId: 'table-move',
        sectionId: section.sectionId,
        number: 11,
        capacity: 4,
        posX: 40,
        posY: 40,
        width: 80,
        height: 80,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      const updated = await service.updateTable({
        tableId: 'table-move',
        posX: 60,
        posY: 60,
      });

      expect(updated.posX).toBe(60);
      expect(updated.posY).toBe(60);
    });
  });

  describe('deleteTable', () => {
    it('deletes table from repository', async () => {
      await service.createTable({
        tableId: 'table-delete',
        sectionId: section.sectionId,
        number: 20,
        capacity: 4,
        posX: 100,
        posY: 100,
        width: 50,
        height: 50,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      await service.deleteTable({ tableId: 'table-delete' });

      const found = await repository.findById('table-delete');
      expect(found).toBeNull();
    });
  });

  describe('listBySection', () => {
    it('returns all tables in a section', async () => {
      await service.createTable({
        tableId: 'table-list-1',
        sectionId: section.sectionId,
        number: 30,
        capacity: 4,
        posX: 10,
        posY: 10,
        width: 50,
        height: 50,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      await service.createTable({
        tableId: 'table-list-2',
        sectionId: section.sectionId,
        number: 31,
        capacity: 4,
        posX: 70,
        posY: 10,
        width: 50,
        height: 50,
        tableImageId: 'table-img',
        chairImageId: 'chair-img',
      });

      const tables = await repository.listBySection(section.sectionId);
      expect(tables.length).toBeGreaterThanOrEqual(2);
    });
  });
});
