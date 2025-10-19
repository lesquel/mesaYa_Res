import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { randomUUID } from 'crypto';
import { Table, TableSectionNotFoundError } from '../../domain/index.js';
import { TableMapper } from '../mappers/index.js';
import { CreateTableCommand, TableResponseDto } from '../dto/index.js';
import {
  TABLE_REPOSITORY,
  type TableRepositoryPort,
  SECTION_TABLE_READER,
  type SectionTableReaderPort,
  TABLE_EVENT_PUBLISHER,
  type TableEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class CreateTableUseCase
  implements UseCase<CreateTableCommand, TableResponseDto>
{
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly repo: TableRepositoryPort,
    @Inject(SECTION_TABLE_READER)
    private readonly sectionReader: SectionTableReaderPort,
    @Inject(TABLE_EVENT_PUBLISHER)
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
