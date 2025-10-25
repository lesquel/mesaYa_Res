import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { TableDomainService } from '../../domain';
import { TableMapper } from '../mappers';
import { CreateTableCommand, TableResponseDto } from '../dto';
import { type TableEventPublisherPort } from '../ports';

export class CreateTableUseCase
  implements UseCase<CreateTableCommand, TableResponseDto>
{
  constructor(
    private readonly tableService: TableDomainService,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: CreateTableCommand): Promise<TableResponseDto> {
    const saved = await this.tableService.createTable({
      tableId: randomUUID(),
      sectionId: command.sectionId,
      number: command.number,
      capacity: command.capacity,
      posX: command.posX,
      posY: command.posY,
      width: command.width,
      tableImageId: command.tableImageId,
      chairImageId: command.chairImageId,
    });
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
