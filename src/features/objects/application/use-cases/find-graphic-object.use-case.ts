import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { GraphicObjectNotFoundError } from '../../domain/index.js';
import { GraphicObjectMapper } from '../mappers/index.js';
import {
  FindGraphicObjectQuery,
  GraphicObjectResponseDto,
} from '../dto/index.js';
import {
  GRAPHIC_OBJECT_REPOSITORY,
  type GraphicObjectRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class FindGraphicObjectUseCase
  implements UseCase<FindGraphicObjectQuery, GraphicObjectResponseDto>
{
  constructor(
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly repo: GraphicObjectRepositoryPort,
  ) {}

  async execute(
    query: FindGraphicObjectQuery,
  ): Promise<GraphicObjectResponseDto> {
    const object = await this.repo.findById(query.objectId);
    if (!object) throw new GraphicObjectNotFoundError(query.objectId);
    return GraphicObjectMapper.toResponse(object);
  }
}
