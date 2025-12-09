import { DeleteTableUseCase } from './delete-table.use-case';
import { TableDomainService, Table } from '../../domain';
import { TableEventPublisherPort } from '../ports';

describe('DeleteTableUseCase', () => {
  let useCase: DeleteTableUseCase;
  let tableService: jest.Mocked<TableDomainService>;
  let eventPublisher: jest.Mocked<TableEventPublisherPort>;

  beforeEach(() => {
    tableService = {
      createTable: jest.fn(),
      updateTable: jest.fn(),
      deleteTable: jest.fn(),
      listBySectionId: jest.fn(),
    } as any;

    eventPublisher = {
      publish: jest.fn(),
    } as any;

    useCase = new DeleteTableUseCase(tableService, eventPublisher);
  });

  it('should delete table and publish event', async () => {
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

    tableService.deleteTable.mockResolvedValue(mockTable);
    eventPublisher.publish.mockResolvedValue(undefined);

    const result = await useCase.execute({ tableId: 'table-1' });

    expect(result.ok).toBe(true);
    expect(result.table.id).toBe('table-1');
    expect(tableService.deleteTable).toHaveBeenCalledWith({
      tableId: 'table-1',
    });
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'table.deleted',
        tableId: 'table-1',
      }),
    );
  });
});
