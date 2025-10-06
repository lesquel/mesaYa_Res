import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from './logger.constants';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER) private readonly logger: ILoggerPort) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = process.hrtime();
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const controllerClass = context.getClass();
    const handlerName = context.getHandler();

    // Info de petición
    const method = req.method;
    const url = req.originalUrl || req.url;
    const params = req.params;
    const query = req.query;
    const body = this.maskSensitive(req.body);

    // Opcional: Ignorar rutas (health, swagger, static...)
    if (this.shouldSkip(url)) {
      return next.handle();
    }

    // Log inicial (DEBUG o INFO según prefieras)
    this.logger.debug(`Incoming request: ${method} ${url}`, '[request]', {
      method,
      url,
      params,
      query,
      body,
    });

    return next.handle().pipe(
      tap(() => {
        const diff = process.hrtime(now);
        const ms = diff[0] * 1000 + diff[1] / 1e6;
        const status = res.statusCode;
        this.logger.log(
          `${method} ${url} ${status} - ${ms.toFixed(2)}ms`,
          `${controllerClass.name}.${handlerName.name}`,
        );
      }),
      catchError((err) => {
        const diff = process.hrtime(now);
        const ms = diff[0] * 1000 + diff[1] / 1e6;
        const status = (err?.status as number) ?? 500;
        // Log de error con trace
        this.logger.error(
          err.message ?? 'Unhandled error',
          err.stack,
          'exception',
          {
            method,
            url,
            status,
            durationMs: ms,
            body,
          },
        );
        return throwError(() => err);
      }),
    );
  }

  private shouldSkip(url: string): boolean {
    const ignore = ['/health', '/favicon.ico', '/api/docs'];
    return ignore.some((path) => url.startsWith(path));
  }
  private maskSensitive(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object') return payload;

    const clone = JSON.parse(JSON.stringify(payload));
    const sensitiveKeys = [
      'password',
      'pass',
      'token',
      'authorization',
      'secret',
    ];

    function walk(obj: any) {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        const lower = key.toLowerCase();
        if (sensitiveKeys.includes(lower)) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          walk(obj[key]);
        } else if (typeof obj[key] === 'string' && obj[key].length > 1000) {
          // evitar loguear payloads enormes
          obj[key] = obj[key].slice(0, 1000) + '...[truncated]';
        }
      }
    }

    walk(clone);
    return clone;
  }
}
