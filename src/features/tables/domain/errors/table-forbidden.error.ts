export class TableForbiddenError extends Error {
  constructor(message = 'Table action forbidden') {
    super(message);
    this.name = TableForbiddenError.name;
  }
}
