export const envConfig = () => ({
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,

  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGSSLMODE: process.env.PGSSLMODE,
  PGCHANNELBINDING: process.env.PGCHANNELBINDING,

  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  CORS_ENABLED: process.env.CORS_ENABLED,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  CORS_METHODS: process.env.CORS_METHODS,
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS,
  CORS_ALLOWED_HEADERS: process.env.CORS_ALLOWED_HEADERS,
  CORS_EXPOSE_HEADERS: process.env.CORS_EXPOSE_HEADERS,
  CORS_MAX_AGE: process.env.CORS_MAX_AGE,

  KAFKA_BROKER: process.env.KAFKA_BROKER,
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID,
});
