import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigService } from '@nestjs/config';

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string')
    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
  return fallback;
}

export function buildCorsOptions(config: ConfigService): CorsOptions | boolean {
  const enabled = parseBool(config.get('CORS_ENABLED'), true);
  if (!enabled) return false;

  const originsStr = config.get<string>('CORS_ORIGINS') ?? '';
  const origins = originsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const methods =
    config.get<string>('CORS_METHODS') ??
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
  const credentials = parseBool(config.get('CORS_CREDENTIALS'), true);
  const allowedHeaders =
    config.get<string>('CORS_ALLOWED_HEADERS') ?? 'Content-Type,Authorization';
  const exposeHeaders = config.get<string>('CORS_EXPOSE_HEADERS') ?? '';
  const maxAge = Number(config.get('CORS_MAX_AGE') ?? 86400);

  const options: CorsOptions = {
    origin: origins.length ? origins : true,
    methods,
    credentials,
    allowedHeaders,
    exposedHeaders: exposeHeaders
      ? exposeHeaders.split(',').map((s) => s.trim())
      : undefined,
    maxAge,
  };

  return options;
}
