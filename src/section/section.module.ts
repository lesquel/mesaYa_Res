import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity.js';
import { Restaurant } from '../restaurant/entities/restaurant.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Restaurant]), AuthModule],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
