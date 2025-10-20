import { UseCase } from '@shared/application/ports/use-case.port.js';
import { TableNotFoundError } from '../../domain/index.js';
import { DeleteTableCommand, DeleteTableResponseDto } from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import {
  type TableRepositoryPort,
  type TableEventPublisherPort,
} from '../ports/index.js';

export class DeleteTableUseCase
  implements UseCase<DeleteTableCommand, DeleteTableResponseDto>
{
  constructor(
    private readonly repo: TableRepositoryPort,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    const existing = await this.repo.findById(command.tableId);
    if (!existing) throw new TableNotFoundError(command.tableId);

    const tableResponse = TableMapper.toResponse(existing);

    await this.repo.delete(command.tableId);
    await this.events.publish({
      type: 'table.deleted',
      tableId: command.tableId,
      sectionId: existing.sectionId,
      occurredAt: new Date(),
    });
    return { ok: true, table: tableResponse };
  }
}
