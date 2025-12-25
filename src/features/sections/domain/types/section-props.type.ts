import type {
  SectionDescription,
  SectionHeight,
  SectionName,
  SectionRestaurantId,
  SectionWidth,
} from '../entities/values';
import type {
  SectionLayoutMetadata,
  SectionStatus,
} from './section-layout-metadata.type';
import type { TableSnapshot } from '@features/tables/domain/types';

export interface SectionProps {
  restaurantId: SectionRestaurantId;
  name: SectionName;
  description: SectionDescription;
  width: SectionWidth;
  height: SectionHeight;
  posX: number;
  posY: number;
  status: SectionStatus;
  layoutMetadata: SectionLayoutMetadata;
  tables?: TableSnapshot[];
  createdAt?: Date;
  updatedAt?: Date;
}
