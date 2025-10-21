import { UseCase } from '@shared/application/ports/use-case.port';
import { TableDomainService } from '../../domain/index';
import { DeleteTableCommand, DeleteTableResponseDto } from '../dto/index';
import { TableMapper } from '../mappers/index';
import { type TableEventPublisherPort } from '../ports/index';

export class DeleteTableUseCase
  implements UseCase<DeleteTableCommand, DeleteTableResponseDto>
{
  constructor(
    private readonly tableService: TableDomainService,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    const removed = await this.tableService.deleteTable({
      tableId: command.tableId,
    });
    const tableResponse = TableMapper.toResponse(removed);

    await this.events.publish({
      type: 'table.deleted',
      tableId: removed.id,
      sectionId: removed.sectionId,
      occurredAt: new Date(),
    });
    return { ok: true, table: tableResponse };
  }
}
