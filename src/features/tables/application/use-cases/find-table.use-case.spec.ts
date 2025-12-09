import { FindTableUseCase } from './find-table.use-case';
import { TableRepositoryPort } from '../ports';
import { Table, TableNotFoundError } from '../../domain';

describe('FindTableUseCase', () => {
  let useCase: FindTableUseCase;
  let repository: jest.Mocked<TableRepositoryPort>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      paginateBySection: jest.fn(),
    } as any;

    useCase = new FindTableUseCase(repository);
  });

  it('should find and return a table', async () => {
    const mockTable = {
      id: 'table-1',
      sectionId: 'section-1',
      snapshot: () => ({
        id: 'table-1',
        sectionId: 'section-1',
        number: 5,
        capacity: 4,
        posX: 10,
        posY: 20,
        width: 100,
        height: 80,
        status: 'DISPONIBLE',
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as any as Table;

    repository.findById.mockResolvedValue(mockTable);

    const result = await useCase.execute({ tableId: 'table-1' });

    expect(result).toBeDefined();
    expect(result.id).toBe('table-1');
    expect(repository.findById).toHaveBeenCalledWith('table-1');
  });

  it('should throw TableNotFoundError when table does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ tableId: 'invalid' })).rejects.toThrow(
      TableNotFoundError,
    );
  });
});
