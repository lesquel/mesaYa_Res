import { Section } from '../../domain';
import { SectionResponseDto } from '../dto';

export class SectionMapper {
  static toResponse(section: Section): SectionResponseDto {
    const snapshot = section.snapshot();
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      name: snapshot.name,
      description: snapshot.description,
      width: snapshot.width,
      height: snapshot.height,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
