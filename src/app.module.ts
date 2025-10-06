import { Module } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { AppConfigModule } from '@shared/core/modules/app-config/app-config.module';
import { DatabaseModule } from '@shared/core/modules/database/database.module';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { FeaturesModule } from '@features/features.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    LoggerModule,
    SeedModule,
    FeaturesModule,
  ],
})
export class AppModule {}
