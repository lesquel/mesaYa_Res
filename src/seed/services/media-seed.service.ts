import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ImageRepositoryPort } from '@features/images/application/ports/image-repository.port';
import { IMAGE_REPOSITORY } from '@features/images/application/ports/image-repository.port';
import type { GraphicObjectRepositoryPort } from '@features/objects/application/ports/graphic-object-repository.port';
import { GRAPHIC_OBJECT_REPOSITORY } from '@features/objects/application/ports/graphic-object-repository.port';
import { Image } from '@features/images/domain/entities/image.entity';
import { GraphicObject } from '@features/objects/domain/entities/graphic-object.entity';
import { imagesSeed, graphicObjectsSeed } from '../data';

@Injectable()
export class MediaSeedService {
  private readonly logger = new Logger(MediaSeedService.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepositoryPort,
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly graphicObjectRepository: GraphicObjectRepositoryPort,
  ) {}

  async seedImages(): Promise<void> {
    this.logger.log('🖼️  Seeding images...');

    // Check if images already exist by checking first image
    const existing = await this.imageRepository.findById(1);
    if (existing) {
      this.logger.log('⏭️  Images already exist, skipping...');
      return;
    }

    for (const imageData of imagesSeed) {
      const image = Image.create({
        url: imageData.url,
        storagePath: imageData.storagePath,
        title: imageData.title,
        description: imageData.description,
        entityId: imageData.entityId,
      });
      await this.imageRepository.save(image);
    }

    this.logger.log(`✅ Created ${imagesSeed.length} images`);
  }

  async seedGraphicObjects(): Promise<void> {
    this.logger.log('🎨 Seeding graphic objects...');

    // Assuming we can check for a known ID or skip check since it's a seed operation
    // For simplicity, we'll create objects without existence check
    // In production, you might want to use a try-catch or paginate to check

    for (const objectData of graphicObjectsSeed) {
      const id = `${objectData.posX}-${objectData.posY}-${objectData.imageId}`;
      const graphicObject = GraphicObject.create(id, {
        posX: objectData.posX,
        posY: objectData.posY,
        width: objectData.width,
        height: objectData.height,
        imageId: objectData.imageId,
      });
      await this.graphicObjectRepository.save(graphicObject);
    }

    this.logger.log(`✅ Created ${graphicObjectsSeed.length} graphic objects`);
  }
}
