import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  setupSwagger,
  configureCors,
  configureGlobalPipes,
} from '@shared/config';

export function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  setupSwagger(app);
  configureCors(app, configService);
  configureGlobalPipes(app);

  return app;
}
