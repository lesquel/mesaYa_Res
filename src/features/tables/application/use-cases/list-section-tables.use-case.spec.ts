import { ListSectionTablesUseCase } from './list-section-tables.use-case';
import { TableRepositoryPort } from '../ports';
import { Table } from '../../domain';

describe('ListSectionTablesUseCase', () => {
  let useCase: ListSectionTablesUseCase;
  let repository: jest.Mocked<TableRepositoryPort>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      paginateBySection: jest.fn(),
    } as any;

    useCase = new ListSectionTablesUseCase(repository);
  });

  it('should list tables for a section with pagination', async () => {
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
      {
        id: 'table-2',
        snapshot: () => ({
          id: 'table-2',
          sectionId: 'section-1',
          number: 2,
          capacity: 4,
          posX: 100,
          posY: 0,
          width: 80,
          height: 80,
          status: 'OCUPADA',
          isAvailable: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    ] as any as Table[];

    repository.paginateBySection.mockResolvedValue({
      results: mockTables,
      total: 2,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute({
      sectionId: 'section-1',
      page: 1,
      limit: 10,
    });

    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.results[0].id).toBe('table-1');
    expect(result.results[1].id).toBe('table-2');
  });

  it('should return empty results for section with no tables', async () => {
    repository.paginateBySection.mockResolvedValue({
      results: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    const result = await useCase.execute({
      sectionId: 'empty-section',
      page: 1,
      limit: 10,
    });

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
