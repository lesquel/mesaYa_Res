export abstract class IRestaurantOwnerPort {
  abstract exists(ownerId: string): Promise<boolean>;
}
