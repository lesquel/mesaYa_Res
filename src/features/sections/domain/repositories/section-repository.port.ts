import { Section } from '../entities/section.entity';

export abstract class ISectionDomainRepositoryPort {
  abstract save(section: Section): Promise<Section>;
  abstract findById(sectionId: string): Promise<Section | null>;
  abstract delete(sectionId: string): Promise<void>;
  abstract findByRestaurantAndName(
    restaurantId: string,
    name: string,
  ): Promise<Section | null>;
}
