import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  APP_HOST: Joi.string().hostname(),
  APP_PORT: Joi.number().port().default(3000),

  APP_TITLE: Joi.string().required(),
  APP_DESCRIPTION: Joi.string().required(),
  APP_VERSION: Joi.string().required(),

  PGHOST: Joi.string().required(),
  PGPORT: Joi.number().port().required(),
  PGDATABASE: Joi.string().required(),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGSSLMODE: Joi.string().required(),
  PGCHANNELBINDING: Joi.string().required(),
  PG_SSL_CERT_PATH: Joi.string().optional().allow(''),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_KEY: Joi.string().required(),
  SUPABASE_BUCKET: Joi.string().required(),

  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  AUTH_SALT_ROUNDS: Joi.number().integer().min(4).max(20).default(10),

  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGINS: Joi.string().default('*'),
  CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  CORS_ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization'),
  CORS_EXPOSE_HEADERS: Joi.string().optional().allow(''),
  CORS_MAX_AGE: Joi.number().integer().min(0).default(86400),

  KAFKA_BROKER: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_GROUP_ID: Joi.string().required(),
});
