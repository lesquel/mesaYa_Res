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

  await app.listen(PORT);
  console.log(
    `Application running on: http://${HOST}:${PORT} — docs: http://${HOST}:${PORT}/docs/api`,
  );
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1); // avoids process.exit(0) to be executed
});
