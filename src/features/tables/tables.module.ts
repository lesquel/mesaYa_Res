import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@features/auth/auth.module';
import { TablesController } from './interface/index';
import {
  TableOrmEntity,
  SectionTypeOrmTableProvider,
  TableTypeOrmRepository,
  TableEventNoopProvider,
  TableAnalyticsTypeOrmRepository,
} from './infrastructure/index';
import { TablesService } from './application/services/index';
import {
  CreateTableUseCase,
  ListTablesUseCase,
  ListSectionTablesUseCase,
  FindTableUseCase,
  UpdateTableUseCase,
  DeleteTableUseCase,
  GetTableAnalyticsUseCase,
} from './application/use-cases/index';
import {
  TABLE_REPOSITORY,
  SECTION_TABLE_READER,
  TABLE_EVENT_PUBLISHER,
  TABLE_ANALYTICS_REPOSITORY,
} from './application/ports/index';
import { SectionOrmEntity } from '../sections/infrastructure/database/typeorm/orm/index';
import type {
  TableRepositoryPort,
  TableEventPublisherPort,
  TableAnalyticsRepositoryPort,
} from './application/ports/index';
import { KafkaService } from '@shared/infrastructure/kafka/index';
import {
  TableDomainService,
  ITableDomainRepositoryPort,
  ITableSectionPort,
} from './domain/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableOrmEntity, SectionOrmEntity]),
    AuthModule,
  ],
  controllers: [TablesController],
  providers: [
    TableTypeOrmRepository,
    SectionTypeOrmTableProvider,
    TableEventNoopProvider,
    TableAnalyticsTypeOrmRepository,
    { provide: TABLE_REPOSITORY, useExisting: TableTypeOrmRepository },
    { provide: SECTION_TABLE_READER, useExisting: SectionTypeOrmTableProvider },
    { provide: TABLE_EVENT_PUBLISHER, useExisting: TableEventNoopProvider },
    {
      provide: TABLE_ANALYTICS_REPOSITORY,
      useExisting: TableAnalyticsTypeOrmRepository,
    },
    {
      provide: ITableDomainRepositoryPort,
      useExisting: TableTypeOrmRepository,
    },
    { provide: ITableSectionPort, useExisting: SectionTypeOrmTableProvider },
    {
      provide: TableDomainService,
      useFactory: (
        repo: ITableDomainRepositoryPort,
        sectionPort: ITableSectionPort,
      ) => new TableDomainService(repo, sectionPort),
      inject: [ITableDomainRepositoryPort, ITableSectionPort],
    },
    {
      provide: CreateTableUseCase,
      useFactory: (
        tableService: TableDomainService,
        events: TableEventPublisherPort,
      ) => new CreateTableUseCase(tableService, events),
      inject: [TableDomainService, TABLE_EVENT_PUBLISHER],
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
        tableService: TableDomainService,
        events: TableEventPublisherPort,
      ) => new UpdateTableUseCase(tableService, events),
      inject: [TableDomainService, TABLE_EVENT_PUBLISHER],
    },
    {
      provide: DeleteTableUseCase,
      useFactory: (
        tableService: TableDomainService,
        events: TableEventPublisherPort,
      ) => new DeleteTableUseCase(tableService, events),
      inject: [TableDomainService, TABLE_EVENT_PUBLISHER],
    },
    {
      provide: GetTableAnalyticsUseCase,
      useFactory: (
        analyticsRepository: TableAnalyticsRepositoryPort,
      ) => new GetTableAnalyticsUseCase(analyticsRepository),
      inject: [TABLE_ANALYTICS_REPOSITORY],
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
    GetTableAnalyticsUseCase,
  ],
})
export class TablesModule {}
