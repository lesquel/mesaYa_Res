export const WINSTON_CONSTANTS = {
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss.SS',
  LEVEL_SYMBOL: Symbol.for('level'),
  ERROR_LOG_FILE: 'logs/error.log',
  COMBINED_LOG_FILE: 'logs/combined.log',
  DEFAULT_LOG_LEVEL: 'info',
} as const;
