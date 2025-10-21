export abstract class ISectionObjectSectionReaderPort {
  abstract exists(sectionId: string): Promise<boolean>;
}
