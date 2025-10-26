import { GraphicObject } from '../../domain';
import { GraphicObjectResponseDto } from '../dto';

export class GraphicObjectMapper {
  static toResponse(entity: GraphicObject): GraphicObjectResponseDto {
    return {
      id: entity.id,
      posX: entity.posX,
      posY: entity.posY,
      width: entity.width,
      height: entity.height,
      imageId: entity.imageId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
