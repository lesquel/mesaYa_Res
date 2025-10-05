export class ReviewOwnershipError extends Error {
  constructor() {
    super('You can only operate on reviews that you created');
    this.name = ReviewOwnershipError.name;
  }
}
