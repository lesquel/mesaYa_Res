/**
 * Pagination params type.
 *
 * Combined type for all pagination, sorting, and search options.
 */

import { PaginateOptions } from './paginate-options.interface';
import { SearchOption } from './search-option.interface';
import { SortOption } from './sort-option.interface';

export type PaginationParams = PaginateOptions & SortOption & SearchOption;
