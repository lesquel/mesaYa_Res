import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { RestaurantsModule } from '@features/restaurants/restaurants.module';
import { OwnerUpgradeService } from './application/services/owner-upgrade.service';
import { OwnerUpgradeRequestRepository } from './infrastructure/database/typeorm/repositories/owner-upgrade-request.repository';
import { OwnerUpgradeRequestOrmEntity } from './infrastructure/database/typeorm/orm/owner-upgrade-request.orm-entity';
import {
  AdminOwnerUpgradeController,
  OwnerUpgradeController,
} from './interface/controllers';

@Module({
  imports: [
    AuthModule,
    RestaurantsModule,
    TypeOrmModule.forFeature([OwnerUpgradeRequestOrmEntity]),
  ],
  controllers: [AdminOwnerUpgradeController, OwnerUpgradeController],
  providers: [OwnerUpgradeService, OwnerUpgradeRequestRepository],
  exports: [OwnerUpgradeService],
})
export class OwnerUpgradeModule {}
