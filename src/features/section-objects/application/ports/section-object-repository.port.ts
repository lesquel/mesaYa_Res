import { PaginatedResult } from '@shared/application/types/pagination.js';
import { SectionObject } from '../../domain/index.js';
import { ListSectionObjectsQuery } from '../dto/index.js';

export const SECTION_OBJECT_REPOSITORY = Symbol('SECTION_OBJECT_REPOSITORY');

export interface SectionObjectRepositoryPort {
  save(entity: SectionObject): Promise<SectionObject>;
  findById(id: string): Promise<SectionObject | null>;
  delete(id: string): Promise<void>;
  paginate(
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>>;
  paginateBySection(
    sectionId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>>;
  paginateByObject(
    objectId: string,
    query: ListSectionObjectsQuery,
  ): Promise<PaginatedResult<SectionObject>>;
}
