export class GraphicObjectNotFoundError extends Error {
  constructor(id: string) {
    super(`GraphicObject not found: ${id}`);
    this.name = 'GraphicObjectNotFoundError';
  }
}
