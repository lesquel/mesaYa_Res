import { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

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

  const CORS_METHODS = config.get<string>('CORS_METHODS');
  const CORS_CREDENTIALS = config.get<string>('CORS_CREDENTIALS');
  const CORS_ALLOWED_HEADERS = config.get<string>('CORS_ALLOWED_HEADERS');
  const CORS_EXPOSE_HEADERS = config.get<string>('CORS_EXPOSE_HEADERS');
  const CORS_MAX_AGE = config.get<string>('CORS_MAX_AGE');

  return {
    origin: origins.length ? origins : true,
    methods: CORS_METHODS ?? 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: parseBool(CORS_CREDENTIALS, true),
    allowedHeaders: CORS_ALLOWED_HEADERS ?? 'Content-Type,Authorization',
    exposedHeaders: CORS_EXPOSE_HEADERS?.split(',').map((s) => s.trim()),
    maxAge: Number(CORS_MAX_AGE ?? 86400),
  };
}

export function configureCors(app: INestApplication, config: ConfigService) {
  const options = buildCorsOptions(config);
  app.enableCors(options);
}
