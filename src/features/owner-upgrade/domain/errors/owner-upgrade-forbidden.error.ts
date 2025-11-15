export class OwnerUpgradeForbiddenError extends Error {
  constructor(message = 'owner.upgrade.errors.forbidden') {
    super(message);
    this.name = OwnerUpgradeForbiddenError.name;
  }
}
