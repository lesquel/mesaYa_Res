import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Section, Restaurant])],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
