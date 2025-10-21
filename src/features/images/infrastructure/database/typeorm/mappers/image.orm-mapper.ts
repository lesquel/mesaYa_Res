import { Image } from '../../../../domain/index.js';
import { ImageOrmEntity } from '../orm/index.js';

export class ImageOrmMapper {
  static toOrmEntity(image: Image): ImageOrmEntity {
    const entity = new ImageOrmEntity();
    if (image.maybeId !== null) entity.id = image.maybeId;
    entity.url = image.url;
    entity.title = image.title;
    entity.description = image.description;
    entity.entityId = image.entityId;
    entity.createdAt = image.createdAt;
    return entity;
  }

  static toDomain(entity: ImageOrmEntity): Image {
    return Image.rehydrate({
      id: entity.id,
      url: entity.url,
      title: entity.title,
      description: entity.description,
      entityId: entity.entityId,
      createdAt: entity.createdAt,
    });
  }
}
