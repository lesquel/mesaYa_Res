/**
 * Paginate options interface.
 *
 * Options for pagination.
 */

export interface PaginateOptions {
  page?: number; // 1-based
  limit?: number; // per page
  offset?: number; // takes precedence over page
  route?: string; // base route to build links
}
