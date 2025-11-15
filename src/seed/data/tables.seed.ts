import { sectionsSeed } from './sections.seed';
import { graphicObjectsSeed } from './graphic-objects.seed';

export interface TableSeedData {
  sectionIndex: number;
  number: number;
  capacity: number;
  posX: number;
  posY: number;
  width: number;
  tableImageIndex: number;
  chairImageIndex: number;
}

const TABLES_PER_SECTION = 2;

export const tablesSeed: TableSeedData[] = sectionsSeed.flatMap(
  (_, sectionIndex) =>
    Array.from({ length: TABLES_PER_SECTION }, (_, tableOffset) => ({
      sectionIndex,
      number: sectionIndex * TABLES_PER_SECTION + tableOffset + 1,
      capacity: 2 + ((tableOffset + 1) % 3) * 2,
      posX: 40 + tableOffset * 120,
      posY: 40 + sectionIndex * 12,
      width: 90 + tableOffset * 15,
      tableImageIndex: (sectionIndex + tableOffset) % graphicObjectsSeed.length,
      chairImageIndex:
        (sectionIndex + tableOffset + 2) % graphicObjectsSeed.length,
    })),
);
