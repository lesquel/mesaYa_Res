/**
 * Paginate repository function.
 *
 * Paginates results from a TypeORM Repository.
 */

import { PaginatedResult } from '@shared/application/types/pagination';
import {
  FindManyOptions,
  FindOptionsOrder,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { buildLink } from './build-link';
import { PaginationParams } from './pagination-params.type';

export async function paginateRepository<T extends ObjectLiteral>(
  repo: Repository<T>,
  baseOptions: FindManyOptions<T>,
  params: PaginationParams,
): Promise<PaginatedResult<T>> {
  const {
    limit = 10,
    offset,
    page,
    route = '/',
    sortBy,
    sortOrder = 'ASC',
  } = params;

  const effOffset = offset ?? (page && page > 0 ? page - 1 : 0) * limit;

  const order = sortBy
    ? ({ [sortBy]: sortOrder } as FindOptionsOrder<T>)
    : undefined;

  const [items, total] = await repo.findAndCount({
    ...baseOptions,
    take: limit,
    skip: effOffset,
    order,
  });

  const currentPage =
    offset === undefined ? (page ?? 1) : Math.floor(effOffset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const hasNext = currentPage < pages;
  const hasPrev = currentPage > 1;

  const baseParams = { limit } as Record<string, any>;
  if (sortBy) baseParams.sortBy = sortBy;
  if (sortOrder) baseParams.sortOrder = sortOrder;

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
