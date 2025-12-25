export class ObjectNotFoundForSectionObjectError extends Error {
  constructor(objectId: string) {
    super(`Object not found for SectionObject: ${objectId}`);
    this.name = 'ObjectNotFoundForSectionObjectError';
  }
}
