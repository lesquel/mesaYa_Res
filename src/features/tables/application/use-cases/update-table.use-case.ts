import { UseCase } from '@shared/application/ports/use-case.port';
import { TableDomainService } from '../../domain/index';
import { UpdateTableCommand, TableResponseDto } from '../dto/index';
import { TableMapper } from '../mappers/index';
import { type TableEventPublisherPort } from '../ports/index';

export class UpdateTableUseCase
  implements UseCase<UpdateTableCommand, TableResponseDto>
{
  constructor(
    private readonly tableService: TableDomainService,
    private readonly events: TableEventPublisherPort,
  ) {}

  async execute(command: UpdateTableCommand): Promise<TableResponseDto> {
    const saved = await this.tableService.updateTable({
      tableId: command.tableId,
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
      type: 'table.updated',
      tableId: saved.id,
      sectionId: saved.sectionId,
      occurredAt: new Date(),
      data: { number: saved.number, capacity: saved.capacity },
    });
    return TableMapper.toResponse(saved);
  }
}
