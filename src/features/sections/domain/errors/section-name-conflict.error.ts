export class SectionNameConflictError extends Error {
  constructor(restaurantId: string, name: string) {
    super(
      `Restaurant '${restaurantId}' already has a section named '${name}'. Choose a different name.`,
    );
    this.name = 'SectionNameConflictError';
  }
}
