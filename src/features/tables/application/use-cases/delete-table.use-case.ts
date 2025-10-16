import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { TableNotFoundError } from '../../domain/index.js';
import { DeleteTableCommand, DeleteTableResponseDto } from '../dto/index.js';
import {
  TABLE_REPOSITORY,
  type TableRepositoryPort,
  TABLE_EVENT_PUBLISHER,
  type TableEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class DeleteTableUseCase
  implements UseCase<DeleteTableCommand, DeleteTableResponseDto>
{
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly repo: TableRepositoryPort,
    @Inject(TABLE_EVENT_PUBLISHER)
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: DeleteTableCommand): Promise<DeleteTableResponseDto> {
    const existing = await this.repo.findById(command.tableId);
    if (!existing) throw new TableNotFoundError(command.tableId);

    await this.repo.delete(command.tableId);
    await this.events.publish({
      type: 'table.deleted',
      tableId: command.tableId,
      sectionId: existing.sectionId,
      occurredAt: new Date(),
    });
    return { ok: true };
  }
}
