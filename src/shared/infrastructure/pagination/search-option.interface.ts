/**
 * Search option interface.
 *
 * Options for text search.
 */

export interface SearchOption {
  q?: string;
  searchable?: string[]; // columns to apply ILIKE
}
