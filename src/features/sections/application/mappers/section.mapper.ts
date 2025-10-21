import { Section } from '../../domain/index';
import { SectionResponseDto } from '../dto/index';

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
    };
  }
}
