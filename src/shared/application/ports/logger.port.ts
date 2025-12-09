export interface LoggerPort {
  log(message: string, context?: string, meta?: unknown): void;
  warn(message: string, context?: string, meta?: unknown): void;
  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: unknown,
  ): void;
  debug(message: string, context?: string, meta?: unknown): void;
  verbose(message: string, context?: string, meta?: unknown): void;
}

// Alias for backward compatibility
export type ILoggerPort = LoggerPort;
