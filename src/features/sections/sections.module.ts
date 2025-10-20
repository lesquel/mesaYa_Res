import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { RestaurantOrmEntity } from '../restaurants/index';
import { SectionsController } from './interface/index';
import {
  SectionOrmEntity,
  SectionTypeOrmRepository,
  RestaurantTypeOrmSectionProvider,
} from './infrastructure/index';
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
} from './application/index';
import type {
  SectionRepositoryPort,
  RestaurantSectionReaderPort,
} from './application/index';
import { KafkaService } from '@shared/infrastructure/kafka/index';

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
    {
      provide: CreateSectionUseCase,
      useFactory: (
        sectionRepository: SectionRepositoryPort,
        restaurantReader: RestaurantSectionReaderPort,
      ) => new CreateSectionUseCase(sectionRepository, restaurantReader),
      inject: [SECTION_REPOSITORY, RESTAURANT_SECTION_READER],
    },
    {
      provide: ListSectionsUseCase,
      useFactory: (sectionRepository: SectionRepositoryPort) =>
        new ListSectionsUseCase(sectionRepository),
      inject: [SECTION_REPOSITORY],
    },
    {
      provide: ListRestaurantSectionsUseCase,
      useFactory: (sectionRepository: SectionRepositoryPort) =>
        new ListRestaurantSectionsUseCase(sectionRepository),
      inject: [SECTION_REPOSITORY],
    },
    {
      provide: FindSectionUseCase,
      useFactory: (sectionRepository: SectionRepositoryPort) =>
        new FindSectionUseCase(sectionRepository),
      inject: [SECTION_REPOSITORY],
    },
    {
      provide: UpdateSectionUseCase,
      useFactory: (
        sectionRepository: SectionRepositoryPort,
        restaurantReader: RestaurantSectionReaderPort,
      ) => new UpdateSectionUseCase(sectionRepository, restaurantReader),
      inject: [SECTION_REPOSITORY, RESTAURANT_SECTION_READER],
    },
    {
      provide: DeleteSectionUseCase,
      useFactory: (sectionRepository: SectionRepositoryPort) =>
        new DeleteSectionUseCase(sectionRepository),
      inject: [SECTION_REPOSITORY],
    },
    {
      provide: SectionsService,
      useFactory: (
        createSectionUseCase: CreateSectionUseCase,
        listSectionsUseCase: ListSectionsUseCase,
        listRestaurantSectionsUseCase: ListRestaurantSectionsUseCase,
        findSectionUseCase: FindSectionUseCase,
        updateSectionUseCase: UpdateSectionUseCase,
        deleteSectionUseCase: DeleteSectionUseCase,
        kafkaService: KafkaService,
      ) =>
        new SectionsService(
          createSectionUseCase,
          listSectionsUseCase,
          listRestaurantSectionsUseCase,
          findSectionUseCase,
          updateSectionUseCase,
          deleteSectionUseCase,
          kafkaService,
        ),
      inject: [
        CreateSectionUseCase,
        ListSectionsUseCase,
        ListRestaurantSectionsUseCase,
        FindSectionUseCase,
        UpdateSectionUseCase,
        DeleteSectionUseCase,
        KafkaService,
      ],
    },
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
