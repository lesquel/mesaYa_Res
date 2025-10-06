import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function configureCors(
  app: INestApplication,
  configService: ConfigService,
) {
  const corsOptions = {
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.enableCors(corsOptions);
}
