import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
          autoLoadEntities: true,
          synchronize: !isProd,
          ssl: useSSL ? { rejectUnauthorized: false } : false,
          extra: {
            channelBinding: config.get<string>('PGCHANNELBINDING') ?? 'require',
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
