import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './common/config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { buildCorsOptions } from './common/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  setupSwagger(app);

  // CORS desde variables de entorno (ver CORS_* en Joi)
  const configService = app.get(ConfigService);

  const corsOptions = buildCorsOptions(configService);

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
