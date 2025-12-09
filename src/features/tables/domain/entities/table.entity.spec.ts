import { Table } from './table.entity';
import { InvalidTableDataError } from '../errors/invalid-table-data.error';

describe('Table Entity', () => {
  const validProps = {
    sectionId: 'section-123',
    number: 1,
    capacity: 4,
    posX: 0,
    posY: 0,
    width: 100,
    height: 100,
    tableImageId: 'table-img-1',
    chairImageId: 'chair-img-1',
  };

  describe('create', () => {
    it('should create a table with valid props', () => {
      const table = Table.create('table-1', validProps);
      expect(table).toBeInstanceOf(Table);
      expect(table.id).toBe('table-1');
      expect(table.number).toBe(1);
      expect(table.capacity).toBe(4);
    });

    it('should set default status to AVAILABLE', () => {
      const table = Table.create('table-1', validProps);
      expect(table.status).toBe('AVAILABLE');
    });

    it('should set default isAvailable to true', () => {
      const table = Table.create('table-1', validProps);
      expect(table.isAvailable).toBe(true);
    });

    it('should use width as height if height not provided', () => {
      const table = Table.create('table-1', validProps);
      expect(table.height).toBe(100);
    });

    it('should use provided height if given', () => {
      const table = Table.create('table-1', { ...validProps, height: 150 });
      expect(table.height).toBe(150);
    });

    it('should throw error for invalid number', () => {
      expect(() =>
        Table.create('table-1', { ...validProps, number: 0 }),
      ).toThrow(InvalidTableDataError);
    });

    it('should throw error for negative capacity', () => {
      expect(() =>
        Table.create('table-1', { ...validProps, capacity: -1 }),
      ).toThrow(InvalidTableDataError);
    });

    it('should throw error for negative posX', () => {
      expect(() =>
        Table.create('table-1', { ...validProps, posX: -1 }),
      ).toThrow(InvalidTableDataError);
    });

    it('should throw error for negative width', () => {
      expect(() =>
        Table.create('table-1', { ...validProps, width: 0 }),
      ).toThrow(InvalidTableDataError);
    });
  });

  describe('update', () => {
    it('should update table properties', () => {
      const table = Table.create('table-1', validProps);
      table.update({ capacity: 6 });
      expect(table.capacity).toBe(6);
    });

    it('should update multiple properties', () => {
      const table = Table.create('table-1', validProps);
      table.update({ capacity: 6, number: 2 });
      expect(table.capacity).toBe(6);
      expect(table.number).toBe(2);
    });

    it('should throw error for invalid update', () => {
      const table = Table.create('table-1', validProps);
      expect(() => table.update({ capacity: -1 })).toThrow(
        InvalidTableDataError,
      );
    });
  });

  describe('snapshot', () => {
    it('should return complete snapshot', () => {
      const table = Table.create('table-1', validProps);
      const snapshot = table.snapshot();
      expect(snapshot.id).toBe('table-1');
      expect(snapshot.number).toBe(1);
      expect(snapshot.capacity).toBe(4);
      expect(snapshot.createdAt).toBeInstanceOf(Date);
      expect(snapshot.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('rehydrate', () => {
    it('should rehydrate from snapshot', () => {
      const snapshot = {
        id: 'table-1',
        ...validProps,
        status: 'AVAILABLE' as const,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const table = Table.rehydrate(snapshot);
      expect(table).toBeInstanceOf(Table);
      expect(table.id).toBe('table-1');
      expect(table.number).toBe(1);
    });
  });

  describe('getters', () => {
    it('should expose all properties via getters', () => {
      const table = Table.create('table-1', validProps);
      expect(table.id).toBe('table-1');
      expect(table.sectionId).toBe('section-123');
      expect(table.number).toBe(1);
      expect(table.capacity).toBe(4);
      expect(table.posX).toBe(0);
      expect(table.posY).toBe(0);
      expect(table.width).toBe(100);
      expect(table.height).toBe(100);
      expect(table.tableImageId).toBe('table-img-1');
      expect(table.chairImageId).toBe('chair-img-1');
      expect(table.status).toBe('AVAILABLE');
      expect(table.isAvailable).toBe(true);
    });
  });
});
