import { ListTablesUseCase } from './list-tables.use-case';
import { TableRepositoryPort } from '../ports';
import { Table } from '../../domain';

describe('ListTablesUseCase', () => {
  let useCase: ListTablesUseCase;
  let repository: jest.Mocked<TableRepositoryPort>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      paginateBySection: jest.fn(),
      listByRestaurantId: jest.fn(),
    } as any;

    useCase = new ListTablesUseCase(repository);
  });

  it('should list all tables for a restaurant', async () => {
    const mockTables = [
      {
        id: 'table-1',
        snapshot: () => ({
          id: 'table-1',
          sectionId: 'section-1',
          number: 1,
          capacity: 2,
          posX: 0,
          posY: 0,
          width: 50,
          height: 50,
          status: 'DISPONIBLE',
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    ] as any as Table[];

    repository.listByRestaurantId.mockResolvedValue(mockTables);

    const result = await useCase.execute({ restaurantId: 'restaurant-1' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('table-1');
  });
});
