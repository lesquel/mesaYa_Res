import { Module } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { AppConfigModule } from '@shared/infrastructure/adapters/app-config/app-config.module';
import { DatabaseModule } from '@shared/infrastructure/adapters/database/database.module';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { AppController } from './app.controller';
import { FeaturesModule } from '@features/features.module';
@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    LoggerModule,
    SeedModule,
    FeaturesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
