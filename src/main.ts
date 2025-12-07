import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.bootstrap';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerAdapter } from '@shared/infrastructure/adapters/logger/wiston/winstonLogger.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerAdapter(),
  });
  configureApp(app);

  const configService = app.get(ConfigService);
  const HOST = configService.get<string>('APP_HOST');
  const PORT = configService.get<number>('APP_PORT', 3000);

  const logger = app.get(WinstonLoggerAdapter);
  await app.listen(PORT);
  logger.log(
    `Application running on: http://${HOST}:${PORT} — docs: http://${HOST}:${PORT}/docs/api`,
    'Bootstrap',
  );
}

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
