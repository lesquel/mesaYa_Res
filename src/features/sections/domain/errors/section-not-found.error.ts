export class SectionNotFoundError extends Error {
  constructor(public readonly sectionId: string) {
    super(`Section ${sectionId} not found`);
    this.name = SectionNotFoundError.name;
  }
}
