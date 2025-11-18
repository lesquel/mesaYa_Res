export class OwnerUpgradeRequestNotFoundError extends Error {
  constructor(requestId: string) {
    super(`Owner upgrade request not found for id ${requestId}`);
    this.name = OwnerUpgradeRequestNotFoundError.name;
  }
}
