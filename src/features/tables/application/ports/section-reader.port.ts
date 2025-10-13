export const SECTION_TABLE_READER = Symbol('SECTION_TABLE_READER');

export interface SectionTableReaderPort {
  exists(sectionId: string): Promise<boolean>;
}
