export const envConfig = () => ({
  PGHOST: process.env.PGHOST,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGSSLMODE: process.env.PGSSLMODE,
  PGCHANNELBINDING: process.env.PGCHANNELBINDING,
});
