import { UseCase } from '@shared/application/ports/use-case.port.js';
import { TableNotFoundError } from '../../domain/index.js';
import { FindTableQuery, TableResponseDto } from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import { type TableRepositoryPort } from '../ports/index.js';

export class FindTableUseCase
  implements UseCase<FindTableQuery, TableResponseDto>
{
  constructor(private readonly repo: TableRepositoryPort) {}

  async execute(query: FindTableQuery): Promise<TableResponseDto> {
    const table = await this.repo.findById(query.tableId);
    if (!table) throw new TableNotFoundError(query.tableId);
    return TableMapper.toResponse(table);
  }
}
