import { GraphicObject } from '../../domain/index.js';
import { GraphicObjectResponseDto } from '../dto/index.js';

export class GraphicObjectMapper {
  static toResponse(entity: GraphicObject): GraphicObjectResponseDto {
    return {
      id: entity.id,
      posX: entity.posX,
      posY: entity.posY,
      width: entity.width,
      height: entity.height,
      imageId: entity.imageId,
    };
  }
}
