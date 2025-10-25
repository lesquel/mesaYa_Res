export interface BaseLogMeta {
  context?: string;
  meta?: Record<string, unknown>;
  trace?: string;
}

export interface BaseLogPayload {
  timestamp: unknown;
  level: string;
  message: unknown;
  context?: string;
  meta?: unknown;
  trace?: string;
}
