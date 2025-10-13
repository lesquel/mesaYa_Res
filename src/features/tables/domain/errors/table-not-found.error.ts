export class TableNotFoundError extends Error {
  constructor(tableId: string) {
    super(`Table with id '${tableId}' was not found`);
    this.name = 'TableNotFoundError';
  }
}
