import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { User } from '../auth/entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, User]), AuthModule],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
