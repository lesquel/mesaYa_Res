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
});
