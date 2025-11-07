import { GraphicObject } from '../../../../domain/index.js';
import { GraphicObjectOrmEntity } from '../orm/index.js';

export class GraphicObjectOrmMapper {
  static toDomain(entity: GraphicObjectOrmEntity): GraphicObject {
    return GraphicObject.create(entity.id, {
      posX: entity.posX,
      posY: entity.posY,
      width: entity.width,
      height: entity.height,
      imageId: entity.imageId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrmEntity(domain: GraphicObject): GraphicObjectOrmEntity {
    const s = domain.snapshot();
    const e = new GraphicObjectOrmEntity();
    e.id = s.id;
    e.posX = s.posX;
    e.posY = s.posY;
    e.width = s.width;
    e.height = s.height;
    e.imageId = s.imageId;
    return e;
  }
}
