import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { PaginatedResult } from '../../../../shared/application/types/pagination.js';
import { GraphicObject } from '../../domain/index.js';
import { GraphicObjectMapper } from '../mappers/index.js';
import { ListGraphicObjectsQuery, GraphicObjectResponseDto } from '../dto/index.js';
import { GRAPHIC_OBJECT_REPOSITORY, type GraphicObjectRepositoryPort } from '../ports/index.js';

export type PaginatedGraphicObjectResponse = PaginatedResult<GraphicObjectResponseDto>;

@Injectable()
export class ListGraphicObjectsUseCase implements UseCase<ListGraphicObjectsQuery, PaginatedGraphicObjectResponse> {
  constructor(@Inject(GRAPHIC_OBJECT_REPOSITORY) private readonly repo: GraphicObjectRepositoryPort) {}

  async execute(query: ListGraphicObjectsQuery): Promise<PaginatedGraphicObjectResponse> {
    const result = await this.repo.paginate(query);
    return { ...result, results: result.results.map((o) => GraphicObjectMapper.toResponse(o)) };
  }
}
