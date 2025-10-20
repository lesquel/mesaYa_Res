import { UseCase } from '@shared/application/ports/use-case.port';
import { PaginatedTableResponse, ListTablesQuery } from '../dto/index';
import { TableMapper } from '../mappers/index';
import { type TableRepositoryPort } from '../ports/index';

export class ListTablesUseCase
  implements UseCase<ListTablesQuery, PaginatedTableResponse>
{
  constructor(private readonly repo: TableRepositoryPort) {}

  async execute(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    const result = await this.repo.paginate(query);
    return {
      ...result,
      results: result.results.map((t) => TableMapper.toResponse(t)),
    };
  }
}
