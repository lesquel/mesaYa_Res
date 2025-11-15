export class OwnerUpgradeMissingDataError extends Error {
  constructor(detail: string) {
    super(`owner.upgrade.errors.missingData:${detail}`);
    this.name = OwnerUpgradeMissingDataError.name;
  }
}
