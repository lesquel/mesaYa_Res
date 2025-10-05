import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity.js';
import { RestaurantOrmEntity } from '../features/restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section, RestaurantOrmEntity]),
    AuthModule,
  ],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
