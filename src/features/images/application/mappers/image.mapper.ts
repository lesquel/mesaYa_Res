import { Image } from '../../domain/index';
import { ImageResponseDto } from '../dto/index';

export class ImageMapper {
  static toResponse(image: Image): ImageResponseDto {
    return {
      id: image.id,
      url: image.url,
      title: image.title,
      description: image.description,
      entityId: image.entityId,
      createdAt: image.createdAt,
    };
  }
}
