import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { PaginatedResult } from '@shared/application/types/pagination';
import { GraphicObject } from '../../domain/index';
import { GraphicObjectMapper } from '../mappers/index';
import {
  ListGraphicObjectsQuery,
  GraphicObjectResponseDto,
} from '../dto/index';
import {
  GRAPHIC_OBJECT_REPOSITORY,
  type GraphicObjectRepositoryPort,
} from '../ports/index';

export type PaginatedGraphicObjectResponse =
  PaginatedResult<GraphicObjectResponseDto>;

@Injectable()
export class ListGraphicObjectsUseCase
  implements UseCase<ListGraphicObjectsQuery, PaginatedGraphicObjectResponse>
{
  constructor(
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly repo: GraphicObjectRepositoryPort,
  ) {}

  async execute(
    query: ListGraphicObjectsQuery,
  ): Promise<PaginatedGraphicObjectResponse> {
    const result = await this.repo.paginate(query);
    return {
      ...result,
      results: result.results.map((o) => GraphicObjectMapper.toResponse(o)),
    };
  }
}
