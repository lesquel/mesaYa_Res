import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.bootstrap';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST', 'localhost');
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`Application running on: http://${host}:${port}`);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
