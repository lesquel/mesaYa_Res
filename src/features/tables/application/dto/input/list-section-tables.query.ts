import { ListTablesQuery } from './list-tables.query';

export interface ListSectionTablesQuery extends ListTablesQuery {
  sectionId: string;
}
