import { ListTablesQuery } from './list-tables.query.js';

export interface ListSectionTablesQuery extends ListTablesQuery {
  sectionId: string;
}
