import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.bootstrap';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerAdapter } from '@shared/infrastructure/adapters/logger/wiston/winstonLogger.adapter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new WinstonLoggerAdapter();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Increase body parser limit to 10MB for large payloads (e.g., images)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  configureApp(app);

  const configService = app.get(ConfigService);
  const HOST = configService.get<string>('APP_HOST');
  const PORT = configService.get<number>('APP_PORT', 3000);

  await app.listen(PORT);
  logger.log(
    `Application running on: http://${HOST}:${PORT} — docs: http://${HOST}:${PORT}/docs/api`,
    'Bootstrap',
  );
}

(async () => {
  try {
    await bootstrap();
  } catch (err) {
    const logger = new WinstonLoggerAdapter();

    logger.error(
      'Error during application bootstrap',
      (err as Error).stack,
      'Bootstrap',
    );

    process.exit(1);
  }
})();
