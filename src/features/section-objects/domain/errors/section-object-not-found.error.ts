export class SectionObjectNotFoundError extends Error {
  constructor(id: string) {
    super(`SectionObject not found: ${id}`);
    this.name = 'SectionObjectNotFoundError';
  }
}
