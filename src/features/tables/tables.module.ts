import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { TablesController } from './interface/index.js';
import {
  TableOrmEntity,
  SectionTypeOrmTableProvider,
  TableTypeOrmRepository,
  TableEventNoopProvider,
} from './infrastructure/index.js';
import { TablesService } from './application/services/index.js';
import {
  CreateTableUseCase,
  ListTablesUseCase,
  ListSectionTablesUseCase,
  FindTableUseCase,
  UpdateTableUseCase,
  DeleteTableUseCase,
} from './application/use-cases/index.js';
import {
  TABLE_REPOSITORY,
  SECTION_TABLE_READER,
  TABLE_EVENT_PUBLISHER,
} from './application/ports/index.js';
import { SectionOrmEntity } from '../sections/infrastructure/database/typeorm/orm/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([TableOrmEntity, SectionOrmEntity]), AuthModule],
  controllers: [TablesController],
  providers: [
    { provide: TABLE_REPOSITORY, useClass: TableTypeOrmRepository },
    { provide: SECTION_TABLE_READER, useClass: SectionTypeOrmTableProvider },
    { provide: TABLE_EVENT_PUBLISHER, useClass: TableEventNoopProvider },
    CreateTableUseCase,
    ListTablesUseCase,
    ListSectionTablesUseCase,
    FindTableUseCase,
    UpdateTableUseCase,
    DeleteTableUseCase,
    TablesService,
  ],
  exports: [
    CreateTableUseCase,
    ListTablesUseCase,
    ListSectionTablesUseCase,
    FindTableUseCase,
    UpdateTableUseCase,
    DeleteTableUseCase,
    TablesService,
  ],
})
export class TablesModule {}
