export class InvalidSectionObjectDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSectionObjectDataError';
  }
}
