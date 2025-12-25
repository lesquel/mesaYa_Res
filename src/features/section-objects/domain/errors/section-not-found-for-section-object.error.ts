export class SectionNotFoundForSectionObjectError extends Error {
  constructor(sectionId: string) {
    super(`Section not found for SectionObject: ${sectionId}`);
    this.name = 'SectionNotFoundForSectionObjectError';
  }
}
