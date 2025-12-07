import {
  BadRequestException,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { Request } from 'express';
import { PaginationDto } from '@shared/application/dto/pagination.dto';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';

export interface PaginationParamsOptions {
  defaultRoute?: string;
  allowSearch?: boolean;
  /**
   * If true, do not forbid non-whitelisted query params. Useful when callers
   * want to include extra filter params (status, restaurantId, date, etc.)
   */
  allowExtraParams?: boolean;
}

/**
 * Aggregate pagination query params into a reusable object with validation.
 */
export const PaginationParams = createParamDecorator(
  (
    options: PaginationParamsOptions | undefined,
    ctx: ExecutionContext,
  ): PaginatedQueryParams => {
    const opts = options ?? {};
    const request = ctx.switchToHttp().getRequest<Request>();

    const dto = plainToInstance(PaginationDto, request.query, {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });

    const validationErrors = validateSync(dto, {
      skipMissingProperties: true,
      whitelist: true,
      // allowExtraParams toggles whether unknown query params cause validation failure
      forbidNonWhitelisted: !opts.allowExtraParams,
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    const route =
      opts.defaultRoute ??
      request.baseUrl ??
      request.path ??
      request.originalUrl ??
      '/';

    const allowSearch = opts.allowSearch ?? true;

    const pageSize = (dto as Record<string, unknown>).pageSize;
    const effectiveLimit =
      dto.limit ?? (typeof pageSize === 'number' ? pageSize : undefined);

    const filters = opts.allowExtraParams
      ? extractFilterParams(request.query)
      : undefined;

    return {
      pagination: {
        page: dto.page,
        limit: effectiveLimit,
        offset: dto.offset,
      },
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      search: allowSearch ? (dto.q ?? undefined) : undefined,
      route,
      filters,
    };
  },
);

const RESERVED_QUERY_KEYS = new Set([
  'page',
  'pageSize',
  'limit',
  'offset',
  'sortBy',
  'sortOrder',
  'q',
]);

function extractFilterParams(
  query: Request['query'],
): Record<string, string> | undefined {
  if (!query || typeof query !== 'object') {
    return undefined;
  }

  const filters: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_QUERY_KEYS.has(key)) {
      continue;
    }

    const normalized = normalizeQueryValue(value);
    if (!normalized) {
      continue;
    }

    filters[key] = normalized;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

function normalizeQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0]);
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
