export class TableLayoutOutOfBoundsError extends Error {
  constructor(sectionId: string) {
    super(
      `Table layout exceeds the boundaries of section '${sectionId}'. Adjust position or width to fit within the section.`,
    );
    this.name = 'TableLayoutOutOfBoundsError';
  }
}
