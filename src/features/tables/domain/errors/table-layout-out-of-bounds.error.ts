export class TableLayoutOutOfBoundsError extends Error {
  constructor(
    sectionId: string,
    details?: {
      table: { x: number; y: number; width: number; height: number };
      section: { width: number; height: number };
    },
  ) {
    let message = `Table layout exceeds the boundaries of section '${sectionId}'. Adjust position or width to fit within the section.`;
    if (details) {
      message += ` Table: [x=${details.table.x}, y=${details.table.y}, w=${details.table.width}, h=${details.table.height}]. Section: [w=${details.section.width}, h=${details.section.height}].`;
    }
    super(message);
    this.name = 'TableLayoutOutOfBoundsError';
  }
}
