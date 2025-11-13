import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IS_PAGINATED_ENDPOINT } from '@shared/interface/decorators/paginated-endpoint.decorator';

interface PaginationShape {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  offset?: number;
  links?: Record<string, string | null> | null;
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const handler = context.getHandler();
    const isPaginatedEndpoint = Boolean(
      this.reflector.get<boolean>(IS_PAGINATED_ENDPOINT, handler) ??
        this.reflector.get<boolean>(IS_PAGINATED_ENDPOINT, context.getClass()),
    );

    return next.handle().pipe(
      map((payload) => {
        if (payload === undefined || payload === null) {
          return payload;
        }

        if (Buffer.isBuffer(payload)) {
          return payload;
        }

        if (typeof payload === 'string') {
          return { data: payload };
        }

        if (this.isStream(payload)) {
          return payload;
        }

        if (this.hasDataEnvelope(payload)) {
          return this.ensurePaginationDefaults(payload);
        }

        if (isPaginatedEndpoint || this.looksLikePaginatedResult(payload)) {
          return {
            data: Array.isArray(payload.results) ? payload.results : [],
            pagination: this.buildPagination(payload),
          };
        }

        if (Array.isArray(payload)) {
          return { data: payload };
        }

        return { data: payload };
      }),
    );
  }

  private hasDataEnvelope(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      Object.prototype.hasOwnProperty.call(value, 'data')
    );
  }

  private looksLikePaginatedResult(
    value: unknown,
  ): value is Record<string, any> {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Record<string, any>;
    return (
      Array.isArray(candidate.results) &&
      typeof candidate.total === 'number' &&
      (typeof candidate.page === 'number' ||
        typeof candidate.limit === 'number')
    );
  }

  private buildPagination(result: Record<string, any>): PaginationShape {
    const page = this.toNumber(result.page, 1);
    const limit = this.toNumber(
      result.limit ?? result.pageSize,
      result.results?.length ?? 0,
    );
    const total = this.toNumber(result.total ?? result.totalItems, 0);
    const pages = this.toNumber(
      result.pages ?? result.totalPages,
      limit ? Math.ceil(total / limit) : 0,
    );

    const pagination: PaginationShape = {
      page,
      pageSize: limit,
      totalItems: total,
      totalPages: pages,
      hasNext:
        typeof result.hasNext === 'boolean' ? result.hasNext : page < pages,
      hasPrev: typeof result.hasPrev === 'boolean' ? result.hasPrev : page > 1,
    };

    if (typeof result.offset === 'number') {
      pagination.offset = result.offset;
    }

    if (result.links && typeof result.links === 'object') {
      pagination.links = {
        self: this.toLink(result.links.self),
        next: this.toLink(result.links.next),
        prev: this.toLink(result.links.prev),
        first: this.toLink(result.links.first),
        last: this.toLink(result.links.last),
      };
    }

    return pagination;
  }

  private ensurePaginationDefaults<T extends Record<string, any>>(value: T): T {
    const target = value as Record<string, any>;
    const pagination = target.pagination;

    if (!pagination || typeof pagination !== 'object') {
      return value;
    }

    const normalized = {
      ...pagination,
      pageSize: this.toNumber(pagination.pageSize ?? pagination.limit, 0),
      totalItems: this.toNumber(pagination.totalItems ?? pagination.total, 0),
      totalPages: this.toNumber(pagination.totalPages ?? pagination.pages, 0),
    };

    target.pagination = normalized;
    return value;
  }

  private toNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toLink(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private isStream(value: unknown): boolean {
    return (
      value !== null &&
      typeof value === 'object' &&
      typeof (value as any).pipe === 'function' &&
      typeof (value as any).on === 'function'
    );
  }
}
