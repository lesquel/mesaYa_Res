import {
  BadRequestException,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { Request } from 'express';
import { PaginationDto } from '@shared/application/dto/pagination.dto.js';
import type { PaginatedQueryParams } from '@shared/application/types/pagination.js';

export interface PaginationParamsOptions {
  defaultRoute?: string;
  allowSearch?: boolean;
}

/**
 * Aggregate pagination query params into a reusable object with validation.
 */
export const PaginationParams = createParamDecorator(
  (
    options: PaginationParamsOptions = {},
    ctx: ExecutionContext,
  ): PaginatedQueryParams => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const dto = plainToInstance(PaginationDto, request.query, {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });

    const validationErrors = validateSync(dto, {
      skipMissingProperties: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors);
    }

    const route =
      options.defaultRoute ??
      request.baseUrl ??
      request.path ??
      request.originalUrl ??
      '/';

    const allowSearch = options.allowSearch ?? true;

    return {
      pagination: {
        page: dto.page,
        limit: dto.limit,
        offset: dto.offset,
      },
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      search: allowSearch ? (dto.q ?? undefined) : undefined,
      route,
    };
  },
);
