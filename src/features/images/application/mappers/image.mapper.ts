import { Image } from '../../domain';
import { ImageResponseDto } from '../dto';

export class ImageMapper {
  static toResponse(image: Image): ImageResponseDto {
    return {
      id: image.id,
      url: image.url,
      storagePath: image.storagePath,
      title: image.title,
      description: image.description,
      entityId: image.entityId,
      createdAt: image.createdAt,
    };
  }
}
