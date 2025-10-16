import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { PaginatedTableResponse, ListTablesQuery } from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import { TABLE_REPOSITORY, type TableRepositoryPort } from '../ports/index.js';

@Injectable()
export class ListTablesUseCase
  implements UseCase<ListTablesQuery, PaginatedTableResponse>
{
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly repo: TableRepositoryPort,
  ) {}

  async execute(query: ListTablesQuery): Promise<PaginatedTableResponse> {
    const result = await this.repo.paginate(query);
    return {
      ...result,
      results: result.results.map((t) => TableMapper.toResponse(t)),
    };
  }
}
