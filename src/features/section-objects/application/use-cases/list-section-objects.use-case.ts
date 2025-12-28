import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaginatedResult } from '@shared/application/types';
import { SectionObject } from '../../domain';
import { SectionObjectMapper } from '../mappers';
import { ListSectionObjectsQuery, SectionObjectResponseDto } from '../dto';
import {
  SECTION_OBJECT_REPOSITORY,
  type SectionObjectRepositoryPort,
} from '../ports';

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
