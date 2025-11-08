import { GraphicObject } from '../../domain/index';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListGraphicObjectsQuery } from '../dto/index';

export const GRAPHIC_OBJECT_REPOSITORY = Symbol('GRAPHIC_OBJECT_REPOSITORY');

export interface GraphicObjectRepositoryPort {
  save(object: GraphicObject): Promise<GraphicObject>;
  findById(id: string): Promise<GraphicObject | null>;
  delete(id: string): Promise<void>;
  paginate(
    query: ListGraphicObjectsQuery,
  ): Promise<PaginatedResult<GraphicObject>>;
}
