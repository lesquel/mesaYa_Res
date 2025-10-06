import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  setupSwagger,
  configureCors,
  configureGlobalPipes,
  configureLogger,
} from '@shared/core/config';

export function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  setupSwagger(app);
  configureCors(app, configService);
  configureGlobalPipes(app);
  configureLogger(app);

  return app;
}
