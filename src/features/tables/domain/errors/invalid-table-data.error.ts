export class InvalidTableDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTableDataError';
  }
}
