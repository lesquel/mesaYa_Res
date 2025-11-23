import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { SeedModule } from './seed/seed.module';
import { AppConfigModule } from '@shared/infrastructure/adapters/app-config/app-config.module';
import { DatabaseModule } from '@shared/infrastructure/adapters/database/database.module';
import { LoggerModule } from '@shared/infrastructure/adapters/logger/logger.module';
import { AppController } from './app.controller';
import { KafkaModule } from '@shared/infrastructure/kafka';
import { FeaturesModule } from '@features/features.module';
import { ReservationModule } from '@features/reservation';
import { THROTTLER_CONFIG } from '@shared/core/config';
import { ThrottlerBehindProxyGuard } from '@shared/infrastructure/guards/throttler-behind-proxy.guard';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    LoggerModule,
    KafkaModule,
    ThrottlerModule.forRoot(THROTTLER_CONFIG),
    SeedModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
