export interface ILoggerPort {
  log(message: string, context?: string, meta?: any): void;
  warn(message: string, context?: string, meta?: any): void;
  error(message: string, trace?: string, context?: string, meta?: any): void;
  debug(message: string, context?: string, meta?: any): void;
  verbose(message: string, context?: string, meta?: any): void;
}
