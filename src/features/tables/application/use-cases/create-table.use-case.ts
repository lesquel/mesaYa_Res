import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { Table, TableSectionNotFoundError } from '../../domain/index';
import { TableMapper } from '../mappers/index';
import { CreateTableCommand, TableResponseDto } from '../dto/index';
import {
  type TableRepositoryPort,
  type SectionTableReaderPort,
  type TableEventPublisherPort,
} from '../ports/index';

export class CreateTableUseCase
  implements UseCase<CreateTableCommand, TableResponseDto>
{
  constructor(
    private readonly repo: TableRepositoryPort,
    private readonly sectionReader: SectionTableReaderPort,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: CreateTableCommand): Promise<TableResponseDto> {
    const sectionExists = await this.sectionReader.exists(command.sectionId);
    if (!sectionExists) throw new TableSectionNotFoundError(command.sectionId);

    const table = Table.create(randomUUID(), {
      sectionId: command.sectionId,
      number: command.number,
      capacity: command.capacity,
      posX: command.posX,
      posY: command.posY,
      width: command.width,
      tableImageId: command.tableImageId,
      chairImageId: command.chairImageId,
    });

    const saved = await this.repo.save(table);
    await this.events.publish({
      type: 'table.created',
      tableId: saved.id,
      sectionId: saved.sectionId,
      occurredAt: new Date(),
      data: { number: saved.number, capacity: saved.capacity },
    });
    return TableMapper.toResponse(saved);
  }
}
