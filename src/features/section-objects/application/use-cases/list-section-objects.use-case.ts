import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { SectionObject } from '../../domain/index.js';
import { SectionObjectMapper } from '../mappers/index.js';
import {
  ListSectionObjectsQuery,
  SectionObjectResponseDto,
} from '../dto/index.js';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
} from '../ports/index.js';

export type PaginatedSectionObjectResponse =
  PaginatedResult<SectionObjectResponseDto>;

@Injectable()
export class ListSectionObjectsUseCase
  implements UseCase<ListSectionObjectsQuery, PaginatedSectionObjectResponse>
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
  ) {}

  async execute(
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    const result = await this.repo.paginate(query);
    return {
      ...result,
      results: result.results.map((e: SectionObject) =>
        SectionObjectMapper.toResponse(e),
      ),
    };
  }
}

@Injectable()
export class ListBySectionUseCase
  implements
    UseCase<
      { sectionId: string } & ListSectionObjectsQuery,
      PaginatedSectionObjectResponse
    >
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
  ) {}
  async execute(
    query: { sectionId: string } & ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    const result = await this.repo.paginateBySection(query.sectionId, query);
    return {
      ...result,
      results: result.results.map((e: SectionObject) =>
        SectionObjectMapper.toResponse(e),
      ),
    };
  }
}

@Injectable()
export class ListByObjectUseCase
  implements
    UseCase<
      { objectId: string } & ListSectionObjectsQuery,
      PaginatedSectionObjectResponse
    >
{
  constructor(
    @Inject(SECTION_OBJECT_REPOSITORY)
    private readonly repo: SectionObjectRepositoryPort,
  ) {}
  async execute(
    query: { objectId: string } & ListSectionObjectsQuery,
  ): Promise<PaginatedSectionObjectResponse> {
    const result = await this.repo.paginateByObject(query.objectId, query);
    return {
      ...result,
      results: result.results.map((e: SectionObject) =>
        SectionObjectMapper.toResponse(e),
      ),
    };
  }
}
