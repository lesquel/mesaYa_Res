export class TableLayoutCollisionError extends Error {
  constructor(sectionId: string) {
    super(
      `Table layout collides with another table in section '${sectionId}'. Adjust position to avoid overlap.`,
    );
    this.name = 'TableLayoutCollisionError';
  }
}
