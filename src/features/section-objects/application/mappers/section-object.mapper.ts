import { SectionObject } from '../../domain/index';
import { SectionObjectResponseDto } from '../dto/index';

export class SectionObjectMapper {
  static toResponse(entity: SectionObject): SectionObjectResponseDto {
    return {
      id: entity.id,
      sectionId: entity.sectionId,
      objectId: entity.objectId,
    };
  }
}
