export class TableSectionNotFoundError extends Error {
  constructor(sectionId: string) {
    super(`Section with id '${sectionId}' was not found`);
    this.name = 'TableSectionNotFoundError';
  }
}
