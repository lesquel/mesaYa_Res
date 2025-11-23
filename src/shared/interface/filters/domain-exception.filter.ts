import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Request, Response } from 'express';
import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

const UNAUTHORIZED_KEYWORDS = [
  'Unauthorized',
  'Unauthenticated',
  'Credentials',
];
const FORBIDDEN_KEYWORDS = ['Ownership', 'Permission', 'Forbidden'];
const CONFLICT_KEYWORDS = ['Already', 'Exists', 'Conflict'];
const BAD_REQUEST_KEYWORDS = ['Invalid', 'Validation', 'Must'];
const NOT_FOUND_KEYWORDS = ['NotFound', 'Missing'];

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof Error) {
      this.logger.error(`[Traceback] ${exception.message}`, exception.stack);
    }

    if (exception instanceof HttpException) {
      this.respondFromHttpException(exception, host);
      return;
    }

    // Special-case TypeORM DB errors for friendlier client responses
    if (exception instanceof QueryFailedError) {
      const err: any = exception as any;
      const message = err?.message ?? 'Query failed';
      const sqlCode = err?.driverError?.code ?? err?.code ?? null;

      // Postgres foreign key violation => 409 Conflict
      if (sqlCode === '23503' || /foreign key/i.test(message)) {
        this.respondFromDomainError(
          new Error(
            'Conflict due to related resource (foreign key constraint)',
          ),
          host,
          HttpStatus.CONFLICT,
          { originalMessage: message },
        );
        return;
      }

      // Other SQL errors: expose as 400 with original message details
      this.respondFromDomainError(
        new Error('Database query failed'),
        host,
        HttpStatus.BAD_REQUEST,
        { originalMessage: message },
      );
      return;
    }

    if (exception instanceof BaseDomainError) {
      this.respondFromDomainError(
        exception,
        host,
        exception.statusCode,
        exception.details,
      );
      return;
    }

    if (exception instanceof Error) {
      const status = this.resolveStatusFromName(
        exception.name ?? exception.constructor.name,
      );
      this.respondFromDomainError(exception, host, status);
      return;
    }

    this.logger.error(
      'Unhandled non-error exception',
      JSON.stringify(exception),
    );
    this.respondWithInternalError(host);
  }

  private respondFromHttpException(
    exception: HttpException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const normalized = this.normalizeHttpExceptionPayload(body, exception);

    response.status(status).json({
      statusCode: status,
      message: normalized.message,
      error: normalized.error,
      details: normalized.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private respondFromDomainError(
    exception: Error,
    host: ArgumentsHost,
    statusCode: number,
    details?: Record<string, unknown>,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (statusCode >= 500) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.warn(exception.message);
    }

    response.status(statusCode).json({
      statusCode,
      message: exception.message,
      error: exception.name,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveStatusFromName(errorName: string): number {
    if (this.includesAny(errorName, UNAUTHORIZED_KEYWORDS)) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (this.includesAny(errorName, FORBIDDEN_KEYWORDS)) {
      return HttpStatus.FORBIDDEN;
    }
    if (this.includesAny(errorName, CONFLICT_KEYWORDS)) {
      return HttpStatus.CONFLICT;
    }
    if (this.includesAny(errorName, NOT_FOUND_KEYWORDS)) {
      return HttpStatus.NOT_FOUND;
    }
    if (this.includesAny(errorName, BAD_REQUEST_KEYWORDS)) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private includesAny(target: string, keywords: string[]): boolean {
    return keywords.some((keyword) => target.includes(keyword));
  }

  private respondWithInternalError(host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private normalizeHttpExceptionPayload(
    body: unknown,
    exception: HttpException,
  ): { message: string; error: string; details?: unknown } {
    let message = exception.message ?? 'Unexpected error';
    let error = exception.name ?? 'HttpException';
    let details: unknown;

    if (typeof body === 'string') {
      message = body;
    } else if (body && typeof body === 'object') {
      const payload = body as Record<string, unknown>;

      if (typeof payload.message === 'string') {
        message = payload.message;
      } else if (Array.isArray(payload.message)) {
        message = 'Validation failed';
        details = { issues: payload.message };
      } else if (payload.message && typeof payload.message === 'object') {
        message = 'Validation failed';
        details = payload.message;
      }

      if (typeof payload.error === 'string') {
        error = payload.error;
      }

      if (payload.details !== undefined && details === undefined) {
        details = payload.details;
      }

      if (details === undefined) {
        const { statusCode, message: _, error: __, ...rest } = payload;
        if (Object.keys(rest).length > 0) {
          details = rest;
        }
      }
    }

    return { message, error, details };
  }
}
