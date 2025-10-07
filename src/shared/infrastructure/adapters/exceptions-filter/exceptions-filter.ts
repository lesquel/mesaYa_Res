import type { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { BaseDomainError } from '@shared/domain/errors/base-domain-error';
import { LOGGER } from '../logger/logger.constants';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly isProd: boolean;

  constructor(
    @Inject(LOGGER) private readonly logger: ILoggerPort,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'development';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const response = this.getResponse(host);
    const { statusCode, message, details } = this.parseException(exception);

    // Log centralizado del error
    this.logError(exception, statusCode, details);

    // Respuesta HTTP al cliente
    response
      .status(statusCode)
      .json(this.buildResponse(statusCode, message, details));
  }

  // --- Helpers ---

  /** Extrae el objeto Response de Express */
  private getResponse(host: ArgumentsHost): Response {
    return host.switchToHttp().getResponse<Response>();
  }

  /** Determina status, mensaje y detalles según el tipo de excepción */
  private parseException(exception: unknown): {
    statusCode: number;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof BaseDomainError) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: 500,
        message: exception.message || 'Internal server error',
      };
    }

    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  }

  /** Construye el objeto de respuesta JSON */
  private buildResponse(
    statusCode: number,
    message: string,
    details?: unknown,
  ) {
    return {
      statusCode,
      message,
      ...(details ? { details } : {}),
    };
  }

  /** Logger centralizado, muestra stack solo si NO estamos en producción */
  private logError(exception: unknown, statusCode: number, details?: unknown) {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack =
      !this.isProd && exception instanceof Error ? exception.stack : undefined;

    this.logger.error(message, stack, 'exception', {
      statusCode,
      ...(details ? { details } : {}),
    });
  }
}
