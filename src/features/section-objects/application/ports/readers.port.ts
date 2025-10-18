export const SECTION_READER_FOR_SECTION_OBJECT = Symbol('SECTION_READER_FOR_SECTION_OBJECT');
export const OBJECT_READER_FOR_SECTION_OBJECT = Symbol('OBJECT_READER_FOR_SECTION_OBJECT');

export interface SectionReaderForSectionObjectPort { exists(sectionId: string): Promise<boolean> }
export interface ObjectReaderForSectionObjectPort { exists(objectId: string): Promise<boolean> }
