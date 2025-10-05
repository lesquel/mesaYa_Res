import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { SectionsController } from './interface/controllers/sections.controller.js';
import { SectionOrmEntity } from './infrastructure/orm/section.orm-entity.js';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/orm/restaurant.orm-entity.js';
import { SectionTypeOrmRepository } from './infrastructure/repositories/section-typeorm.repository.js';
import { RestaurantTypeOrmSectionProvider } from './infrastructure/providers/restaurant-typeorm.provider.js';
import { CreateSectionUseCase } from './application/use-cases/create-section.use-case.js';
import { ListSectionsUseCase } from './application/use-cases/list-sections.use-case.js';
import { FindSectionUseCase } from './application/use-cases/find-section.use-case.js';
import { UpdateSectionUseCase } from './application/use-cases/update-section.use-case.js';
import { DeleteSectionUseCase } from './application/use-cases/delete-section.use-case.js';
import { SECTION_REPOSITORY } from './application/ports/section-repository.port.js';
import { RESTAURANT_SECTION_READER } from './application/ports/restaurant-reader.port.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SectionOrmEntity, RestaurantOrmEntity]),
    AuthModule,
  ],
  controllers: [SectionsController],
  providers: [
    {
      provide: SECTION_REPOSITORY,
      useClass: SectionTypeOrmRepository,
    },
    {
      provide: RESTAURANT_SECTION_READER,
      useClass: RestaurantTypeOrmSectionProvider,
    },
    CreateSectionUseCase,
    ListSectionsUseCase,
    FindSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
  ],
  exports: [
    CreateSectionUseCase,
    ListSectionsUseCase,
    FindSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
  ],
})
export class SectionsModule {}
