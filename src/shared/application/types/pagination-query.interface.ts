/**
 * Pagination query interface.
 *
 * Query parameters for pagination.
 */

export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}
