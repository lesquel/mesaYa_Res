/**
 * Paginate query builder function.
 *
 * Paginates results from a TypeORM SelectQueryBuilder.
 */

import { PaginatedResult } from '@shared/application/types/pagination';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { buildLink } from './build-link';
import { canSortByColumn } from './can-sort-by-column';
import { PaginationParams } from './pagination-params.type';

export async function paginateQueryBuilder<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const {
    limit = 10,
    offset,
    page,
    route = '/',
    sortBy,
    sortOrder = 'ASC',
    allowedSorts = [],
    q,
    searchable = [],
  } = params;

  const effOffset = offset ?? (page && page > 0 ? page - 1 : 0) * limit;

  // Apply search
  if (q && searchable.length > 0) {
    const like = `%${q}%`;
    searchable.forEach((col, idx) => {
      const param = `search_${idx}`;
      if (idx === 0) {
        qb.andWhere(`${col} ILIKE :${param}`, { [param]: like });
      } else {
        qb.orWhere(`${col} ILIKE :${param}`, { [param]: like });
      }
    });
  }

  // Apply sorting if allowed
  if (
    sortBy &&
    (allowedSorts.length === 0 || allowedSorts.includes(sortBy)) &&
    canSortByColumn(qb, sortBy)
  ) {
    qb.addOrderBy(sortBy, sortOrder);
  }

  const [items, total] = await qb.take(limit).skip(effOffset).getManyAndCount();

  const currentPage =
    offset === undefined ? (page ?? 1) : Math.floor(effOffset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const hasNext = currentPage < pages;
  const hasPrev = currentPage > 1;

  const baseParams = { limit } as Record<string, any>;
  if (sortBy) baseParams.sortBy = sortBy;
  if (sortOrder) baseParams.sortOrder = sortOrder;
  if (q) baseParams.q = q;

  const links = {
    self: buildLink(route, { ...baseParams, page: currentPage }),
    first: buildLink(route, { ...baseParams, page: 1 }),
    last: buildLink(route, { ...baseParams, page: pages }),
    next: hasNext
      ? buildLink(route, { ...baseParams, page: currentPage + 1 })
      : undefined,
    prev: hasPrev
      ? buildLink(route, { ...baseParams, page: currentPage - 1 })
      : undefined,
  };

  return {
    results: items,
    total,
    page: currentPage,
    limit,
    offset: effOffset,
    pages,
    hasNext,
    hasPrev,
    links,
  };
}
