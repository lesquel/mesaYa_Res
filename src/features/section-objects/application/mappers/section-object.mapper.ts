import { SectionObject } from '../../domain/index.js';
import { SectionObjectResponseDto } from '../dto/index.js';

export class SectionObjectMapper {
  static toResponse(entity: SectionObject): SectionObjectResponseDto {
    return {
      id: entity.id,
      sectionId: entity.sectionId,
      objectId: entity.objectId,
    };
  }
}
