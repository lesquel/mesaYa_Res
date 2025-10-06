import { Section } from '../../domain/index.js';
import { PaginatedResult } from '../../../../shared/interfaces/pagination.js';
import { ListSectionsQuery } from '../dto/index.js';

export const SECTION_REPOSITORY = Symbol('SECTION_REPOSITORY');

export interface SectionRepositoryPort {
  save(section: Section): Promise<Section>;
  findById(id: string): Promise<Section | null>;
  paginate(query: ListSectionsQuery): Promise<PaginatedResult<Section>>;
  delete(id: string): Promise<void>;
}
