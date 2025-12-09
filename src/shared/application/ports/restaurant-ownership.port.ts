/**
 * Port for validating restaurant ownership
 */

export const RESTAURANT_OWNERSHIP_PORT = Symbol('RESTAURANT_OWNERSHIP_PORT');

export interface IRestaurantOwnershipPort {
  validateOwnership(restaurantId: string, ownerId: string): Promise<boolean>;
  getRestaurantOwnerId(restaurantId: string): Promise<string | null>;
  findRestaurantIdByOwner(ownerId: string): Promise<string | null>;
  findRestaurantIdsByOwner(ownerId: string): Promise<string[]>;
  assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void>;
}
