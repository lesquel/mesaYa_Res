import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BaseDomainError } from '@shared/domain/errors/base-domain-error';

const UNAUTHORIZED_KEYWORDS = ['Unauthorized', 'Unauthenticated', 'Credentials'];
const FORBIDDEN_KEYWORDS = ['Ownership', 'Permission', 'Forbidden'];
const CONFLICT_KEYWORDS = ['Already', 'Exists', 'Conflict'];
const BAD_REQUEST_KEYWORDS = ['Invalid', 'Validation', 'Must'];
const NOT_FOUND_KEYWORDS = ['NotFound', 'Missing'];

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      this.respondFromHttpException(exception, host);
      return;
    }

    if (exception instanceof BaseDomainError) {
      this.respondFromDomainError(exception, host, exception.statusCode, exception.details);
      return;
    }

    if (exception instanceof Error) {
      const status = this.resolveStatusFromName(exception.name ?? exception.constructor.name);
      this.respondFromDomainError(exception, host, status);
      return;
    }

    this.logger.error('Unhandled non-error exception', JSON.stringify(exception));
    this.respondWithInternalError(host);
  }

  private respondFromHttpException(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    response.status(status).json(body);
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
}
