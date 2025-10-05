import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PGHOST: Joi.string().required(),
  PGPORT: Joi.number().port().required(),
  PGDATABASE: Joi.string().required(),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGSSLMODE: Joi.string().required(),
  PGCHANNELBINDING: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  // CORS
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGINS: Joi.string().default(
    'http://localhost:4200,http://localhost:5173',
  ),
  CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'),
  CORS_CREDENTIALS: Joi.boolean().default(true),
  CORS_ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization'),
  CORS_EXPOSE_HEADERS: Joi.string().default(''),
  CORS_MAX_AGE: Joi.number().integer().min(0).default(86400),
});
