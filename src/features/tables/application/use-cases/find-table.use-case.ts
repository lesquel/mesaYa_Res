import { UseCase } from '@shared/application/ports/use-case.port';
import { TableNotFoundError } from '../../domain/index';
import { FindTableQuery, TableResponseDto } from '../dto/index';
import { TableMapper } from '../mappers/index';
import { type TableRepositoryPort } from '../ports/index';

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
