import { Section } from '../../domain/entities/section.entity.js';
import { PaginatedResult } from '../../../../shared/core/pagination.js';
import { ListSectionsQuery } from '../dto/input/list-sections.query.js';

export const SECTION_REPOSITORY = Symbol('SECTION_REPOSITORY');

export interface SectionRepositoryPort {
  save(section: Section): Promise<Section>;
  findById(id: string): Promise<Section | null>;
  paginate(query: ListSectionsQuery): Promise<PaginatedResult<Section>>;
  delete(id: string): Promise<void>;
}
