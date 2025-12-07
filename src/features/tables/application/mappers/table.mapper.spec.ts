import { TableMapper } from './table.mapper';
import { Table } from '../../domain';

describe('TableMapper', () => {
  it('should map table entity to response DTO', () => {
    const mockTable = {
      snapshot: () => ({
        id: 'table-1',
        sectionId: 'section-1',
        number: 5,
        capacity: 4,
        posX: 10,
        posY: 20,
        width: 100,
        height: 80,
        tableImageId: 'img-1',
        chairImageId: 'chair-1',
        status: 'DISPONIBLE',
        isAvailable: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }),
    } as Table;

    const result = TableMapper.toResponse(mockTable);

    expect(result).toEqual({
      id: 'table-1',
      sectionId: 'section-1',
      number: 5,
      capacity: 4,
      posX: 10,
      posY: 20,
      width: 100,
      height: 80,
      tableImageId: 'img-1',
      chairImageId: 'chair-1',
      status: 'DISPONIBLE',
      isAvailable: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('should handle tables without optional images', () => {
    const mockTable = {
      snapshot: () => ({
        id: 'table-2',
        sectionId: 'section-2',
        number: 3,
        capacity: 2,
        posX: 0,
        posY: 0,
        width: 50,
        height: 50,
        status: 'OCUPADA',
        isAvailable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as Table;

    const result = TableMapper.toResponse(mockTable);

    expect(result.id).toBe('table-2');
    expect(result.status).toBe('OCUPADA');
    expect(result.isAvailable).toBe(false);
  });
});
