import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { RestaurantsModule } from '@features/restaurants/restaurants.module';
import { OwnerUpgradeService } from './application/services/owner-upgrade.service';
import { OwnerUpgradeRequestRepository } from './infrastructure/database/typeorm/repositories/owner-upgrade-request.repository';
import { OwnerUpgradeRequestOrmEntity } from './infrastructure/database/typeorm/orm/owner-upgrade-request.orm-entity';
import { OWNER_UPGRADE_REQUEST_REPOSITORY } from './owner-upgrade.tokens';
import { OwnerUpgradesController } from './interface/controllers';

@Module({
  imports: [
    AuthModule,
    RestaurantsModule,
    TypeOrmModule.forFeature([OwnerUpgradeRequestOrmEntity]),
  ],
  controllers: [OwnerUpgradesController],
  providers: [
    OwnerUpgradeService,
    {
      provide: OWNER_UPGRADE_REQUEST_REPOSITORY,
      useClass: OwnerUpgradeRequestRepository,
    },
  ],
  exports: [OwnerUpgradeService],
})
export class OwnerUpgradeModule {}
