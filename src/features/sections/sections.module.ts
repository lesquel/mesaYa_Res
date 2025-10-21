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
import type { SectionRepositoryPort } from './application/index';
import { KafkaService } from '@shared/infrastructure/kafka/index';
import {
  SectionDomainService,
  ISectionDomainRepositoryPort,
  ISectionRestaurantPort,
} from './domain/index';

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
      provide: ISectionDomainRepositoryPort,
      useExisting: SectionTypeOrmRepository,
    },
    {
      provide: ISectionRestaurantPort,
      useExisting: RestaurantTypeOrmSectionProvider,
    },
    {
      provide: SectionDomainService,
      useFactory: (
        sectionRepository: ISectionDomainRepositoryPort,
        restaurantPort: ISectionRestaurantPort,
      ) => new SectionDomainService(sectionRepository, restaurantPort),
      inject: [ISectionDomainRepositoryPort, ISectionRestaurantPort],
    },
    {
      provide: CreateSectionUseCase,
      useFactory: (sectionDomainService: SectionDomainService) =>
        new CreateSectionUseCase(sectionDomainService),
      inject: [SectionDomainService],
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
      useFactory: (sectionDomainService: SectionDomainService) =>
        new UpdateSectionUseCase(sectionDomainService),
      inject: [SectionDomainService],
    },
    {
      provide: DeleteSectionUseCase,
      useFactory: (sectionDomainService: SectionDomainService) =>
        new DeleteSectionUseCase(sectionDomainService),
      inject: [SectionDomainService],
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
