export class InvalidSectionDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = InvalidSectionDataError.name;
  }
}
