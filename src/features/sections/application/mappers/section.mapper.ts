import { Section } from '../../domain/entities/section.entity.js';
import { SectionResponseDto } from '../dto/output/section.response.dto.js';

export class SectionMapper {
  static toResponse(section: Section): SectionResponseDto {
    const snapshot = section.snapshot();
    return {
      id: snapshot.id,
      restaurantId: snapshot.restaurantId,
      name: snapshot.name,
      description: snapshot.description,
    };
  }
}
