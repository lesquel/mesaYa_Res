export interface SectionRestaurantSnapshot {
  restaurantId: string;
}

export abstract class ISectionRestaurantPort {
  abstract loadById(
    restaurantId: string,
  ): Promise<SectionRestaurantSnapshot | null>;
}
