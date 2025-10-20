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
