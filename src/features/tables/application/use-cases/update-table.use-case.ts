import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  TableNotFoundError,
  type UpdateTableProps,
} from '../../domain/index.js';
import { UpdateTableCommand, TableResponseDto } from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import {
  type TableRepositoryPort,
  type TableEventPublisherPort,
} from '../ports/index.js';

export class UpdateTableUseCase
  implements UseCase<UpdateTableCommand, TableResponseDto>
{
  constructor(
    private readonly repo: TableRepositoryPort,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: UpdateTableCommand): Promise<TableResponseDto> {
    const table = await this.repo.findById(command.tableId);
    if (!table) throw new TableNotFoundError(command.tableId);

    const { tableId, ...rest } = command;
    void tableId;
    table.update(rest as UpdateTableProps);
    const saved = await this.repo.save(table);
    await this.events.publish({
      type: 'table.updated',
      tableId: saved.id,
      sectionId: saved.sectionId,
      occurredAt: new Date(),
      data: { number: saved.number, capacity: saved.capacity },
    });
    return TableMapper.toResponse(saved);
  }
}
