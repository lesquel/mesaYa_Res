import { Image } from '../../../../domain';
import { ImageOrmEntity } from '../orm';

export class ImageOrmMapper {
  static toOrmEntity(image: Image): ImageOrmEntity {
    const entity = new ImageOrmEntity();
    if (image.maybeId !== null) entity.id = image.maybeId;
    entity.url = image.url;
    entity.storagePath = image.storagePath;
    entity.title = image.title;
    entity.description = image.description;
    entity.entityId = image.entityId;
    entity.createdAt = image.createdAt;
    entity.updatedAt = image.updatedAt;
    return entity;
  }

  static toDomain(entity: ImageOrmEntity): Image {
    return Image.rehydrate({
      id: entity.id,
      url: entity.url,
      storagePath: entity.storagePath,
      title: entity.title,
      description: entity.description,
      entityId: entity.entityId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
