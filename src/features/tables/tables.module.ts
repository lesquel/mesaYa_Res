import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { TablesController } from './interface/index';
import {
  TableOrmEntity,
  SectionTypeOrmTableProvider,
  TableTypeOrmRepository,
  TableEventNoopProvider,
} from './infrastructure/index';
import { TablesService } from './application/services/index';
import {
  CreateTableUseCase,
  ListTablesUseCase,
  ListSectionTablesUseCase,
  FindTableUseCase,
  UpdateTableUseCase,
  DeleteTableUseCase,
} from './application/use-cases/index';
import {
  TABLE_REPOSITORY,
  SECTION_TABLE_READER,
  TABLE_EVENT_PUBLISHER,
} from './application/ports/index';
import { SectionOrmEntity } from '../sections/infrastructure/database/typeorm/orm/index';
import type {
  TableRepositoryPort,
  SectionTableReaderPort,
  TableEventPublisherPort,
} from './application/ports/index';
import { KafkaService } from '@shared/infrastructure/kafka/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableOrmEntity, SectionOrmEntity]),
    AuthModule,
  ],
  controllers: [TablesController],
  providers: [
    { provide: TABLE_REPOSITORY, useClass: TableTypeOrmRepository },
    { provide: SECTION_TABLE_READER, useClass: SectionTypeOrmTableProvider },
    { provide: TABLE_EVENT_PUBLISHER, useClass: TableEventNoopProvider },
    {
      provide: CreateTableUseCase,
      useFactory: (
        repo: TableRepositoryPort,
        sectionReader: SectionTableReaderPort,
        events: TableEventPublisherPort,
      ) => new CreateTableUseCase(repo, sectionReader, events),
      inject: [TABLE_REPOSITORY, SECTION_TABLE_READER, TABLE_EVENT_PUBLISHER],
    },
    {
      provide: ListTablesUseCase,
      useFactory: (repo: TableRepositoryPort) => new ListTablesUseCase(repo),
      inject: [TABLE_REPOSITORY],
    },
    {
      provide: ListSectionTablesUseCase,
      useFactory: (repo: TableRepositoryPort) =>
        new ListSectionTablesUseCase(repo),
      inject: [TABLE_REPOSITORY],
    },
    {
      provide: FindTableUseCase,
      useFactory: (repo: TableRepositoryPort) => new FindTableUseCase(repo),
      inject: [TABLE_REPOSITORY],
    },
    {
      provide: UpdateTableUseCase,
      useFactory: (
        repo: TableRepositoryPort,
        events: TableEventPublisherPort,
      ) => new UpdateTableUseCase(repo, events),
      inject: [TABLE_REPOSITORY, TABLE_EVENT_PUBLISHER],
    },
    {
      provide: DeleteTableUseCase,
      useFactory: (
        repo: TableRepositoryPort,
        events: TableEventPublisherPort,
      ) => new DeleteTableUseCase(repo, events),
      inject: [TABLE_REPOSITORY, TABLE_EVENT_PUBLISHER],
    },
    {
      provide: TablesService,
      useFactory: (
        createTable: CreateTableUseCase,
        listTables: ListTablesUseCase,
        listBySection: ListSectionTablesUseCase,
        findTable: FindTableUseCase,
        updateTable: UpdateTableUseCase,
        deleteTable: DeleteTableUseCase,
        kafkaService: KafkaService,
      ) =>
        new TablesService(
          createTable,
          listTables,
          listBySection,
          findTable,
          updateTable,
          deleteTable,
          kafkaService,
        ),
      inject: [
        CreateTableUseCase,
        ListTablesUseCase,
        ListSectionTablesUseCase,
        FindTableUseCase,
        UpdateTableUseCase,
        DeleteTableUseCase,
        KafkaService,
      ],
    },
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
