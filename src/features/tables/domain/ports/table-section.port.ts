export interface TableSectionSnapshot {
  sectionId: string;
  restaurantId: string;
  width: number;
  height: number;
}

export abstract class ITableSectionPort {
  abstract loadById(sectionId: string): Promise<TableSectionSnapshot | null>;
}
