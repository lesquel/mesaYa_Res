/**
 * Sort option interface.
 *
 * Options for sorting results.
 */

export interface SortOption {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  allowedSorts?: string[]; // whitelist
}
