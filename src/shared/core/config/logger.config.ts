import { INestApplication } from '@nestjs/common';
import { ILoggerPort } from '@shared/application/ports/logger.port';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';

export function configureLogger(app: INestApplication) {
  const logger = app.get<ILoggerPort>(LOGGER);
  app.useLogger(logger);
}
