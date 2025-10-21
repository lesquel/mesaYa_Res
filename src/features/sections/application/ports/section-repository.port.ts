import { Section } from '../../domain/index';
import { PaginatedResult } from '@shared/application/types/pagination';
import { ListRestaurantSectionsQuery, ListSectionsQuery } from '../dto/index';

export const SECTION_REPOSITORY = Symbol('SECTION_REPOSITORY');

export interface SectionRepositoryPort {
  save(section: Section): Promise<Section>;
  findById(id: string): Promise<Section | null>;
  paginate(query: ListSectionsQuery): Promise<PaginatedResult<Section>>;
  paginateByRestaurant(
    query: ListRestaurantSectionsQuery,
  ): Promise<PaginatedResult<Section>>;
  delete(id: string): Promise<void>;
}
