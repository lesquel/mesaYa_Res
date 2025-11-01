export class SectionForbiddenError extends Error {
  constructor(message = 'Section action forbidden') {
    super(message);
    this.name = SectionForbiddenError.name;
  }
}
