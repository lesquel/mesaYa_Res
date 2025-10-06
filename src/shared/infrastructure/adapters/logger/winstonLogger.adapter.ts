import { TransformableInfo } from 'logform';
import { Injectable } from '@nestjs/common';
import { ILoggerPort } from '@shared/application/ports/logger.port';
import { createLogger, format, transports, Logger } from 'winston';

interface LogMeta {
  context?: string;
  meta?: Record<string, unknown>;
  trace?: string;
}

@Injectable()
export class WinstonLoggerAdapter implements ILoggerPort {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.printf((info: TransformableInfo & LogMeta) => {
          const context = info.context ? `[${info.context}]` : '';
          const extra = info.meta ? JSON.stringify(info.meta) : '';
          return `${String(info.timestamp)} ${String(info.level).toUpperCase()} ${context}: ${String(info.message)} ${extra}`;
        }),
      ),
      transports: [
        new transports.Console(),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.info(message, { context, meta });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, { context, meta });
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ) {
    this.logger.error(message, { context, meta, trace });
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, { context, meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.verbose(message, { context, meta });
  }
}
