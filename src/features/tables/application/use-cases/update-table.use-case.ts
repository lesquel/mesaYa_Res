import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { TableNotFoundError } from '../../domain/index.js';
import { UpdateTableCommand, TableResponseDto } from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import {
  TABLE_REPOSITORY,
  type TableRepositoryPort,
  TABLE_EVENT_PUBLISHER,
  type TableEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class UpdateTableUseCase
  implements UseCase<UpdateTableCommand, TableResponseDto>
{
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly repo: TableRepositoryPort,
    @Inject(TABLE_EVENT_PUBLISHER)
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: UpdateTableCommand): Promise<TableResponseDto> {
    const table = await this.repo.findById(command.tableId);
    if (!table) throw new TableNotFoundError(command.tableId);

    const { tableId, ...patch } = command as any;
    table.update(patch);
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
