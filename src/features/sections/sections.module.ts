import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { RestaurantOrmEntity } from '../restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';
import { SectionsController } from './interface';
import {
  SectionOrmEntity,
  SectionTypeOrmRepository,
  RestaurantTypeOrmSectionProvider,
  SectionAnalyticsTypeOrmRepository,
} from './infrastructure';
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
  SECTION_ANALYTICS_REPOSITORY,
  GetSectionAnalyticsUseCase,
  SectionsAccessService,
} from './application';
import type {
  SectionRepositoryPort,
  SectionAnalyticsRepositoryPort,
} from './application';
import { KafkaService } from '@shared/infrastructure/kafka';
import {
  SectionDomainService,
  ISectionDomainRepositoryPort,
  ISectionRestaurantPort,
} from './domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([SectionOrmEntity, RestaurantOrmEntity]),
    AuthModule,
  ],
  controllers: [SectionsController],
  providers: [
    SectionTypeOrmRepository,
    RestaurantTypeOrmSectionProvider,
    SectionAnalyticsTypeOrmRepository,
    {
      provide: SECTION_REPOSITORY,
      useExisting: SectionTypeOrmRepository,
    },
    {
      provide: RESTAURANT_SECTION_READER,
      useExisting: RestaurantTypeOrmSectionProvider,
    },
    {
      provide: SECTION_ANALYTICS_REPOSITORY,
      useExisting: SectionAnalyticsTypeOrmRepository,
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
    SectionsAccessService,
    {
      provide: SectionsService,
      useFactory: (
        createSectionUseCase: CreateSectionUseCase,
        listSectionsUseCase: ListSectionsUseCase,
        listRestaurantSectionsUseCase: ListRestaurantSectionsUseCase,
        findSectionUseCase: FindSectionUseCase,
        updateSectionUseCase: UpdateSectionUseCase,
        deleteSectionUseCase: DeleteSectionUseCase,
        getSectionAnalyticsUseCase: GetSectionAnalyticsUseCase,
        sectionsAccessService: SectionsAccessService,
        kafkaService: KafkaService,
      ) =>
        new SectionsService(
          createSectionUseCase,
          listSectionsUseCase,
          listRestaurantSectionsUseCase,
          findSectionUseCase,
          updateSectionUseCase,
          deleteSectionUseCase,
          getSectionAnalyticsUseCase,
          sectionsAccessService,
          kafkaService,
        ),
      inject: [
        CreateSectionUseCase,
        ListSectionsUseCase,
        ListRestaurantSectionsUseCase,
        FindSectionUseCase,
        UpdateSectionUseCase,
        DeleteSectionUseCase,
        GetSectionAnalyticsUseCase,
        SectionsAccessService,
        KafkaService,
      ],
    },
    {
      provide: GetSectionAnalyticsUseCase,
      useFactory: (analyticsRepository: SectionAnalyticsRepositoryPort) =>
        new GetSectionAnalyticsUseCase(analyticsRepository),
      inject: [SECTION_ANALYTICS_REPOSITORY],
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
    GetSectionAnalyticsUseCase,
    SECTION_REPOSITORY,
    SectionsAccessService,
  ],
})
export class SectionsModule {}
