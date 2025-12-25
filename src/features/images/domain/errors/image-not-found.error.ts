export class ImageNotFoundError extends Error {
  constructor(id: string) {
    super(`Image not found: ${id}`);
    this.name = 'ImageNotFoundError';
  }
}
