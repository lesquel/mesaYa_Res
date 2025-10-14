import { PaginationDto } from '../../../../../shared/application/dto/pagination.dto.js';

export interface ListSectionObjectsQuery {
  pagination: Pick<PaginationDto, 'page' | 'limit' | 'offset'>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string | null;
  route?: string;
}
