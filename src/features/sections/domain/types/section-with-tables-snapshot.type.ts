import type { SectionSnapshot } from './section-snapshot.type';
import type { TableSnapshot } from '@features/tables/domain/entities/table.entity';

export interface SectionWithTablesSnapshot extends SectionSnapshot {
  tables: TableSnapshot[];
}
