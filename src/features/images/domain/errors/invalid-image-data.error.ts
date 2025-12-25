export class InvalidImageDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImageDataError';
  }
}
