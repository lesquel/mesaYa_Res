import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  PaginatedTableResponse,
  ListSectionTablesQuery,
} from '../dto/index.js';
import { TableMapper } from '../mappers/index.js';
import { TABLE_REPOSITORY, type TableRepositoryPort } from '../ports/index.js';

@Injectable()
export class ListSectionTablesUseCase
  implements UseCase<ListSectionTablesQuery, PaginatedTableResponse>
{
  constructor(
    @Inject(TABLE_REPOSITORY) private readonly repo: TableRepositoryPort,
  ) {}

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
