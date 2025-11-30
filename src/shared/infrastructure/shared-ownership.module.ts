import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import { RestaurantOwnershipService } from './services/restaurant-ownership.service';
import { RESTAURANT_OWNERSHIP_PORT } from '../application/ports/restaurant-ownership.port';

/**
 * SharedOwnershipModule provides restaurant ownership validation services
 * that can be used across all features that need to validate restaurant ownership.
 *
 * This module is global, so it only needs to be imported once in the app module
 * and its providers will be available throughout the application.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RestaurantOrmEntity])],
  providers: [
    RestaurantOwnershipService,
    {
      provide: RESTAURANT_OWNERSHIP_PORT,
      useExisting: RestaurantOwnershipService,
    },
  ],
  exports: [RESTAURANT_OWNERSHIP_PORT, RestaurantOwnershipService],
})
export class SharedOwnershipModule {}
