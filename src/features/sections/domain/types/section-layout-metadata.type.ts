export type SectionStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface SectionLayoutMetadata {
  layoutId?: string | null;
  orientation?: 'LANDSCAPE' | 'PORTRAIT';
  zIndex?: number;
  notes?: string | null;
}
