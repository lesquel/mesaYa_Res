import { UseCase } from '@shared/application/ports/use-case.port';
import { PaginatedTableResponse, ListSectionTablesQuery } from '../dto';
import { TableMapper } from '../mappers';
import { type TableRepositoryPort } from '../ports';

export class ListSectionTablesUseCase
  implements UseCase<ListSectionTablesQuery, PaginatedTableResponse>
{
  constructor(private readonly repo: TableRepositoryPort) {}

  async execute(
    query: ListSectionTablesQuery,
  ): Promise<PaginatedTableResponse> {
    const result = await this.repo.paginateBySection(query);
    return {
      ...result,
      results: result.results.map((t) => TableMapper.toResponse(t)),
    };
  }
}
