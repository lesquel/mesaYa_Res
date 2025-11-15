export class OwnerUpgradeNotFoundError extends Error {
  constructor(userId: string) {
    super(`Owner upgrade request not found for user ${userId}`);
    this.name = OwnerUpgradeNotFoundError.name;
  }
}
