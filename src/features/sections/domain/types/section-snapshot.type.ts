import type {
  SectionLayoutMetadata,
  SectionStatus,
} from './section-layout-metadata.type';
import type { TableSnapshot } from '@features/tables/domain/entities/table.entity';

export interface SectionSnapshot {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  width: number;
  height: number;
  posX: number;
  posY: number;
  status: SectionStatus;
  layoutMetadata: SectionLayoutMetadata;
  tables?: TableSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}
