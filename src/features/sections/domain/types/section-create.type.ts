import type {
  SectionLayoutMetadata,
  SectionStatus,
} from './section-layout-metadata.type';

export interface SectionCreate {
  restaurantId: string;
  name: string;
  description?: string | null;
  width: number;
  height: number;
  posX?: number;
  posY?: number;
  status?: SectionStatus;
  layoutMetadata?: SectionLayoutMetadata;
}
