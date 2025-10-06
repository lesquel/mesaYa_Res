import { Format, TransformableInfo } from 'logform';
import { Injectable } from '@nestjs/common';
import { inspect } from 'node:util';
import { ILoggerPort } from '@shared/application/ports/logger.port';
import { createLogger, format, transports, Logger } from 'winston';

interface LogMeta {
  context?: string;
  meta?: Record<string, unknown>;
  trace?: string;
}

@Injectable()
export class WinstonLoggerAdapter implements ILoggerPort {
  private static readonly TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

  private static readonly LEVEL_SYMBOL = Symbol.for('level');

  private static readonly LEVEL_ICONS: Record<string, string> = {
    error: '⛔',
    warn: '⚠️',
    info: 'ℹ️',
    http: '🌐',
    verbose: '🔊',
    debug: '🐞',
    silly: '🎉',
  };

  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      transports: [
        new transports.Console({
          format: WinstonLoggerAdapter.createConsoleFormat(),
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: WinstonLoggerAdapter.createFileFormat(),
        }),
        new transports.File({
          filename: 'logs/combined.log',
          format: WinstonLoggerAdapter.createFileFormat(),
        }),
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

  private static createConsoleFormat(): Format {
    const colorizer = format.colorize({ all: true }) as unknown as {
      colorize: (level: string, message: string) => string;
    };

    return format.combine(
      format.timestamp({ format: this.TIMESTAMP_FORMAT }),
      format.errors({ stack: true }),
      format.printf(
        (info: TransformableInfo & LogMeta & { stack?: string }) => {
          const rawLevel =
            (info[this.LEVEL_SYMBOL] as string) ?? info.level ?? 'info';
          const icon = this.LEVEL_ICONS[rawLevel] ?? '•';
          const contextPart = info.context ? `[${info.context}]` : '';
          const primaryLine = [
            String(info.timestamp),
            icon,
            rawLevel.toUpperCase().padEnd(7),
            contextPart,
            String(info.message),
          ]
            .filter((part) => part && part !== '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          const metaSection = this.formatSection(
            'meta',
            this.stringifyMeta(this.collectMeta(info)),
          );

          const traceSource = info.trace ?? info.stack;
          const traceSection = this.formatSection('trace', traceSource ?? null);

          const segments = [
            colorizer.colorize(rawLevel, primaryLine),
            metaSection,
            traceSection,
          ].filter((segment): segment is string => Boolean(segment));

          return segments.join('\n');
        },
      ),
    );
  }

  private static createFileFormat(): Format {
    return format.combine(
      format.timestamp({ format: this.TIMESTAMP_FORMAT }),
      format.errors({ stack: true }),
      format.printf(
        (info: TransformableInfo & LogMeta & { stack?: string }) => {
          const rawLevel =
            (info[this.LEVEL_SYMBOL] as string) ?? info.level ?? 'info';
          const payload: Record<string, unknown> = {
            timestamp: info.timestamp,
            level: rawLevel,
            message: info.message,
          };

          if (info.context) {
            payload.context = info.context;
          }

          const meta = this.collectMeta(info);
          if (meta) {
            payload.meta = this.sanitizeMeta(meta);
          }

          const trace = info.trace ?? info.stack;
          if (trace) {
            payload.trace = trace;
          }

          return JSON.stringify(payload);
        },
      ),
    );
  }

  private static collectMeta(
    info: TransformableInfo & LogMeta & { [key: string]: unknown },
  ): Record<string, unknown> | undefined {
    const aggregated: Record<string, unknown> =
      info.meta && typeof info.meta === 'object' ? { ...info.meta } : {};

    Object.entries(info).forEach(([key, value]) => {
      if (
        [
          'level',
          'timestamp',
          'message',
          'context',
          'trace',
          'stack',
          'meta',
        ].includes(key)
      ) {
        return;
      }
      aggregated[key] = value;
    });

    return Object.keys(aggregated).length > 0 ? aggregated : undefined;
  }

  private static sanitizeMeta(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeMeta(item));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<
        Record<string, unknown>
      >((acc, [key, nested]) => {
        acc[key] = this.sanitizeMeta(nested);
        return acc;
      }, {});
    }

    return value;
  }

  private static stringifyMeta(meta?: Record<string, unknown>): string | null {
    if (!meta || Object.keys(meta).length === 0) {
      return null;
    }

    const sanitized = this.sanitizeMeta(meta);

    try {
      return JSON.stringify(sanitized, null, 2);
    } catch {
      return inspect(sanitized, { depth: null, colors: false, compact: false });
    }
  }

  private static formatSection(
    label: string,
    value?: string | null,
  ): string | null {
    if (!value) {
      return null;
    }

    const indented = value
      .split('\n')
      .map((line) => `    ${line}`)
      .join('\n');

    return `  ${label}:\n${indented}`;
  }
}
