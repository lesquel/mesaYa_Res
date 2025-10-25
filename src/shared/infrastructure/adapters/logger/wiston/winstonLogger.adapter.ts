import { Injectable } from '@nestjs/common';
import type { Logger } from 'winston';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import { WinstonLoggerFactory } from './factories/winston-logger.factory';

@Injectable()
export class WinstonLoggerAdapter implements ILoggerPort {
  private readonly logger: Logger;

  constructor() {
    this.logger = WinstonLoggerFactory.create();
  }

  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, { context, meta });
  }

  warn(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.warn(message, { context, meta });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.error(message, { context, meta, trace });
  }

  debug(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.debug(message, { context, meta });
  }

  verbose(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.verbose(message, { context, meta });
  }
}
