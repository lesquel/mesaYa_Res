export class TableNumberConflictError extends Error {
  constructor(sectionId: string, tableNumber: number) {
    super(
      `Section '${sectionId}' already contains a table with number ${tableNumber}`,
    );
    this.name = 'TableNumberConflictError';
  }
}
