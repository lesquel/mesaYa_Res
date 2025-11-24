export class TableLayoutOutOfBoundsError extends Error {
  constructor(
    sectionId: string,
    details?: {
      table: { x: number; y: number; width: number; height: number };
      section: { width: number; height: number };
    },
  ) {
    let message = `Table layout exceeds the boundaries of section '${sectionId}'.`;
    if (details) {
      message += ` The table (w=${details.table.width}, h=${details.table.height}) at (x=${details.table.x}, y=${details.table.y}) does not fit within the section dimensions (w=${details.section.width}, h=${details.section.height}).`;
    } else {
      message += ` Adjust position or width to fit within the section.`;
    }
    super(message);
    this.name = 'TableLayoutOutOfBoundsError';
  }
}
