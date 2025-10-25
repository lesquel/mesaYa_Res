export const LOG_META_EXCLUDED_KEYS = [
  'level',
  'timestamp',
  'message',
  'context',
  'trace',
  'stack',
  'meta',
] as const;

export type LogMetaExcludedKey = (typeof LOG_META_EXCLUDED_KEYS)[number];
