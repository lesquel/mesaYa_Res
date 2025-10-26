import { SectionObject } from '../../domain';
import { SectionObjectResponseDto } from '../dto';

export class SectionObjectMapper {
  static toResponse(entity: SectionObject): SectionObjectResponseDto {
    return {
      id: entity.id,
      sectionId: entity.sectionId,
      objectId: entity.objectId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
