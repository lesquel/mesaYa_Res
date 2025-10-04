import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PGHOST: Joi.string().required(),
  PGDATABASE: Joi.string().required(),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGSSLMODE: Joi.string().required(),
  PGCHANNELBINDING: Joi.string().required(),
});
