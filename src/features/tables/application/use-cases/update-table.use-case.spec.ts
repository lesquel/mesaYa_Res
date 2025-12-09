import { UpdateTableUseCase } from './update-table.use-case';
import { TableDomainService, Table } from '../../domain';
import { TableEventPublisherPort } from '../ports';
import { UpdateTableCommand } from '../dto';

describe('UpdateTableUseCase', () => {
  let useCase: UpdateTableUseCase;
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

    useCase = new UpdateTableUseCase(tableService, eventPublisher);
  });

  it('should update a table', async () => {
    const command: UpdateTableCommand = {
      tableId: 'table-1',
      number: 10,
      capacity: 6,
    };

    const mockTable = {
      id: 'table-1',
      sectionId: 'section-1',
      snapshot: () => ({
        id: 'table-1',
        sectionId: 'section-1',
        number: 10,
        capacity: 6,
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

    tableService.updateTable.mockResolvedValue(mockTable);
    eventPublisher.publish.mockResolvedValue(undefined);

    const result = await useCase.execute(command);

    expect(result.id).toBe('table-1');
    expect(result.number).toBe(10);
    expect(tableService.updateTable).toHaveBeenCalled();
    expect(eventPublisher.publish).toHaveBeenCalled();
  });
});
