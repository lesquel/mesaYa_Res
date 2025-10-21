import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { SectionObjectsController } from './interface/index';
import { SectionObjectsService } from './application/index';
import { SectionObjectOrmEntity } from './infrastructure/index';
import { SectionObjectTypeOrmRepository } from './infrastructure/database/typeorm/repositories/section-object-typeorm.repository';
import { SectionTypeOrmReaderForSectionObject } from './infrastructure/providers/section-typeorm.provider';
import { ObjectTypeOrmReaderForSectionObject } from './infrastructure/providers/object-typeorm.provider';
import { SectionObjectEventNoopProvider } from './infrastructure/providers/section-object-event-noop.provider';
import {
  SECTION_OBJECT_REPOSITORY,
  SECTION_READER_FOR_SECTION_OBJECT,
  OBJECT_READER_FOR_SECTION_OBJECT,
  SECTION_OBJECT_EVENT_PUBLISHER,
  CreateSectionObjectUseCase,
  ListSectionObjectsUseCase,
  ListBySectionUseCase,
  ListByObjectUseCase,
  FindSectionObjectUseCase,
  UpdateSectionObjectUseCase,
  DeleteSectionObjectUseCase,
} from './application/index';
import { SectionOrmEntity } from '../sections/infrastructure/database/typeorm/orm/index';
import { GraphicObjectOrmEntity } from '../objects/infrastructure/database/typeorm/orm/index';
import {
  SectionObjectDomainService,
  ISectionObjectDomainRepositoryPort,
  ISectionObjectSectionReaderPort,
  ISectionObjectObjectReaderPort,
} from './domain/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SectionObjectOrmEntity,
      SectionOrmEntity,
      GraphicObjectOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [SectionObjectsController],
  providers: [
    {
      provide: SECTION_OBJECT_REPOSITORY,
      useClass: SectionObjectTypeOrmRepository,
    },
    {
      provide: SECTION_READER_FOR_SECTION_OBJECT,
      useClass: SectionTypeOrmReaderForSectionObject,
    },
    {
      provide: OBJECT_READER_FOR_SECTION_OBJECT,
      useClass: ObjectTypeOrmReaderForSectionObject,
    },
    {
      provide: SECTION_OBJECT_EVENT_PUBLISHER,
      useClass: SectionObjectEventNoopProvider,
    },
    {
      provide: ISectionObjectDomainRepositoryPort,
      useExisting: SectionObjectTypeOrmRepository,
    },
    {
      provide: ISectionObjectSectionReaderPort,
      useExisting: SECTION_READER_FOR_SECTION_OBJECT,
    },
    {
      provide: ISectionObjectObjectReaderPort,
      useExisting: OBJECT_READER_FOR_SECTION_OBJECT,
    },
    {
      provide: SectionObjectDomainService,
      useFactory: (
        repository: ISectionObjectDomainRepositoryPort,
        sectionReader: ISectionObjectSectionReaderPort,
        objectReader: ISectionObjectObjectReaderPort,
      ) =>
        new SectionObjectDomainService(repository, sectionReader, objectReader),
      inject: [
        ISectionObjectDomainRepositoryPort,
        ISectionObjectSectionReaderPort,
        ISectionObjectObjectReaderPort,
      ],
    },
    CreateSectionObjectUseCase,
    ListSectionObjectsUseCase,
    ListBySectionUseCase,
    ListByObjectUseCase,
    FindSectionObjectUseCase,
    UpdateSectionObjectUseCase,
    DeleteSectionObjectUseCase,
    SectionObjectsService,
  ],
  exports: [
    CreateSectionObjectUseCase,
    ListSectionObjectsUseCase,
    ListBySectionUseCase,
    ListByObjectUseCase,
    FindSectionObjectUseCase,
    UpdateSectionObjectUseCase,
    DeleteSectionObjectUseCase,
    SectionObjectsService,
  ],
})
export class SectionObjectsModule {}
