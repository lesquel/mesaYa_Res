import { Injectable } from '@nestjs/common';
import { CreateGraphicObjectCommand, DeleteGraphicObjectCommand, FindGraphicObjectQuery, ListGraphicObjectsQuery, UpdateGraphicObjectCommand, DeleteGraphicObjectResponseDto, GraphicObjectResponseDto } from '../dto/index.js';
import { CreateGraphicObjectUseCase, DeleteGraphicObjectUseCase, FindGraphicObjectUseCase, ListGraphicObjectsUseCase, UpdateGraphicObjectUseCase } from '../use-cases/index.js';
import { PaginatedGraphicObjectResponse } from '../use-cases/list-graphic-objects.use-case.js';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly createObject: CreateGraphicObjectUseCase,
    private readonly listObjects: ListGraphicObjectsUseCase,
    private readonly findObject: FindGraphicObjectUseCase,
    private readonly updateObject: UpdateGraphicObjectUseCase,
    private readonly deleteObject: DeleteGraphicObjectUseCase,
  ) {}

  create(command: CreateGraphicObjectCommand): Promise<GraphicObjectResponseDto> {
    return this.createObject.execute(command);
  }
  list(query: ListGraphicObjectsQuery): Promise<PaginatedGraphicObjectResponse> {
    return this.listObjects.execute(query);
  }
  findOne(query: FindGraphicObjectQuery): Promise<GraphicObjectResponseDto> {
    return this.findObject.execute(query);
  }
  update(command: UpdateGraphicObjectCommand): Promise<GraphicObjectResponseDto> {
    return this.updateObject.execute(command);
  }
  delete(command: DeleteGraphicObjectCommand): Promise<DeleteGraphicObjectResponseDto> {
    return this.deleteObject.execute(command);
  }
}
