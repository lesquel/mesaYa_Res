import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { RestaurantOrmEntity } from '../restaurants/index.js';
import { SectionsController } from './interface/index.js';
import {
  SectionOrmEntity,
  SectionTypeOrmRepository,
  RestaurantTypeOrmSectionProvider,
} from './infrastructure/index.js';
import {
  CreateSectionUseCase,
  ListSectionsUseCase,
  ListRestaurantSectionsUseCase,
  FindSectionUseCase,
  UpdateSectionUseCase,
  DeleteSectionUseCase,
  SectionsService,
  SECTION_REPOSITORY,
  RESTAURANT_SECTION_READER,
} from './application/index.js';

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
    ListRestaurantSectionsUseCase,
    FindSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
    SectionsService,
  ],
  exports: [
    CreateSectionUseCase,
    ListSectionsUseCase,
    ListRestaurantSectionsUseCase,
    FindSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
    SectionsService,
  ],
})
export class SectionsModule {}
