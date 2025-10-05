export class RestaurantOwnerNotFoundError extends Error {
  constructor(public readonly ownerId: string | null) {
    super(`Owner ${ownerId ?? 'unknown'} not found`);
    this.name = RestaurantOwnerNotFoundError.name;
  }
}
