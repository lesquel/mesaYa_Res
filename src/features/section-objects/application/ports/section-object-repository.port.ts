import { PaginatedResult } from '@shared/application/types/pagination';
import { SectionObject } from '../../domain';
import { ListSectionObjectsQuery } from '../dto';

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
