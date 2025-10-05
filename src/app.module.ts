import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from './common/config/env.config';
import { JoiValidationSchema } from './common/config/joi.validation';
import { SeedModule } from './seed/seed.module.js';
import { RestaurantsModule } from './restaurants/restaurants.module.js';
import { SectionModule } from './section/section.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ReviewModule } from './review/review.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: JoiValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const sslMode = config.get<string>('PGSSLMODE');
        const useSSL = sslMode === 'require';

        return {
          type: 'postgres',
          host: config.get<string>('PGHOST'),
          port: config.get<number>('PGPORT') ?? 5432,
          username: config.get<string>('PGUSER'),
          password: config.get<string>('PGPASSWORD'),
          database: config.get<string>('PGDATABASE'),

          // Auto-load entities registered via TypeOrmModule.forFeature
          autoLoadEntities: true,
          // Never synchronize in production
          synchronize: !isProd,

          // Neon requires SSL; disable cert verification for convenience
          ssl: useSSL ? { rejectUnauthorized: false } : false,
          // Pass through pg-specific options
          extra: {
            AuthModule,
            channelBinding: config.get<string>('PGCHANNELBINDING') ?? 'require',
          },
        };
      },
    }),
    SeedModule,
    RestaurantsModule,
    SectionModule,
    AuthModule,
    ReviewModule,
  ],
})
export class AppModule {}
