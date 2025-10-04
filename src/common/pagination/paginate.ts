import {
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

export interface PaginatedResult<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  offset: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first: string;
    last: string;
  };
}

export interface PaginateOptions {
  page?: number; // 1-based
  limit?: number; // per page
  offset?: number; // takes precedence over page
  route?: string; // base route to build links
}

export interface SortOption {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  allowedSorts?: string[]; // whitelist
}

export interface SearchOption {
  q?: string;
  searchable?: string[]; // columns to apply ILIKE
}

export type PaginationParams = PaginateOptions & SortOption & SearchOption;

// Helper to build link with given query params
function buildLink(route: string, params: Record<string, any>) {
  const url = new URL(route, 'http://dummy');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '')
      url.searchParams.set(k, String(v));
  });
  // strip dummy origin
  return url.pathname + (url.search ? url.search : '');
}

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
  if (sortBy && (allowedSorts.length === 0 || allowedSorts.includes(sortBy))) {
    qb.addOrderBy(sortBy, sortOrder);
  }

  const [items, total] = await qb.take(limit).skip(effOffset).getManyAndCount();

  const currentPage =
    offset !== undefined ? Math.floor(effOffset / limit) + 1 : (page ?? 1);
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

  const order = sortBy ? ({ [sortBy]: sortOrder } as any) : undefined;

  const [items, total] = await repo.findAndCount({
    ...baseOptions,
    take: limit,
    skip: effOffset,
    order,
  });

  const currentPage =
    offset !== undefined ? Math.floor(effOffset / limit) + 1 : (page ?? 1);
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
