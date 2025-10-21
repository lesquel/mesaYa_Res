export class PartialPaymentsNotAllowedError extends Error {
  constructor(targetId: string) {
    super(`Partial payments are not allowed for target ${targetId}`);
    this.name = PartialPaymentsNotAllowedError.name;
  }
}
