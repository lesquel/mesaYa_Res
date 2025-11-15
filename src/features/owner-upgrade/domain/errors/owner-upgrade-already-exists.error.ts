export class OwnerUpgradeAlreadyExistsError extends Error {
  constructor(userId: string) {
    super(`owner.upgrade.errors.duplicate:${userId}`);
    this.name = OwnerUpgradeAlreadyExistsError.name;
  }
}
