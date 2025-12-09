import { CreateTableUseCase } from './create-table.use-case';
import { TableDomainService, Table } from '../../domain';
import { TableEventPublisherPort } from '../ports';
import { CreateTableCommand } from '../dto';

describe('CreateTableUseCase', () => {
  let useCase: CreateTableUseCase;
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

    useCase = new CreateTableUseCase(tableService, eventPublisher);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a table and publish event', async () => {
    const command: CreateTableCommand = {
      sectionId: 'section-1',
      number: 5,
      capacity: 4,
      posX: 10,
      posY: 20,
      width: 100,
      height: 80,
    };

    const mockTable = {
      id: 'table-1',
      sectionId: 'section-1',
      number: 5,
      capacity: 4,
      posX: 10,
      posY: 20,
      width: 100,
      height: 80,
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

    tableService.createTable.mockResolvedValue(mockTable);
    eventPublisher.publish.mockResolvedValue(undefined);

    const result = await useCase.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBe('table-1');
    expect(result.number).toBe(5);
    expect(tableService.createTable).toHaveBeenCalledWith(
      expect.objectContaining({
        sectionId: 'section-1',
        number: 5,
        capacity: 4,
      }),
    );
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'table.created',
        tableId: 'table-1',
      }),
    );
  });
});
