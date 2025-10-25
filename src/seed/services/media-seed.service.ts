import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ImageRepositoryPort } from '@features/images/application/ports/image-repository.port';
import { IMAGE_REPOSITORY } from '@features/images/application/ports/image-repository.port';
import type { GraphicObjectRepositoryPort } from '@features/objects/application/ports/graphic-object-repository.port';
import { GRAPHIC_OBJECT_REPOSITORY } from '@features/objects/application/ports/graphic-object-repository.port';
import { Image } from '@features/images/domain/entities/image.entity';
import { GraphicObject } from '@features/objects/domain/entities/graphic-object.entity';
import { imagesSeed, graphicObjectsSeed } from '../data';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MediaSeedService {
  private readonly logger = new Logger(MediaSeedService.name);
  private imageIds: number[] = []; // Track created image IDs
  private graphicObjectIds: string[] = []; // Track created graphic object IDs

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly imageRepository: ImageRepositoryPort,
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly graphicObjectRepository: GraphicObjectRepositoryPort,
  ) {}

  async seedImages(): Promise<void> {
    this.logger.log('🖼️  Seeding images...');

    // Check if images already exist by checking a known seed check ID
    const checkId = 1;
    const existing = await this.imageRepository.findById(checkId);
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
        entityId: imageData.entityIndex, // Using entityIndex instead of hardcoded ID
      });
      const savedImage = await this.imageRepository.save(image);
      this.imageIds.push(savedImage.id);
    }

    this.logger.log(`✅ Created ${imagesSeed.length} images`);
  }

  async seedGraphicObjects(): Promise<void> {
    this.logger.log('🎨 Seeding graphic objects...');

    // If images weren't created in this session, we can't proceed
    if (this.imageIds.length === 0) {
      this.logger.warn(
        '⚠️  No image IDs available. Images must be seeded first in the same session.',
      );
      return;
    }

    for (const objectData of graphicObjectsSeed) {
      // Use the image ID from our tracked list
      const imageId = this.imageIds[objectData.imageIndex];

      if (!imageId) {
        this.logger.warn(
          `Skipping graphic object: image not found at index ${objectData.imageIndex}`,
        );
        continue;
      }

      const graphicObjectId = randomUUID();
      const graphicObject = GraphicObject.create(graphicObjectId, {
        posX: objectData.posX,
        posY: objectData.posY,
        width: objectData.width,
        height: objectData.height,
        imageId: imageId,
      });
      await this.graphicObjectRepository.save(graphicObject);
      this.graphicObjectIds.push(graphicObjectId); // Track the created ID
    }

    this.logger.log(`✅ Created ${graphicObjectsSeed.length} graphic objects`);
  }

  /**
   * Obtiene el ID de la imagen creada según su índice.
   * Útil para que otros servicios de seed puedan referenciar imágenes.
   *
   * @param {number} index - Índice de la imagen (0-based)
   * @returns {number | undefined} - ID de la imagen o undefined si no existe
   */
  getImageId(index: number): number | undefined {
    return this.imageIds[index];
  }

  /**
   * Obtiene todos los IDs de imágenes creadas.
   *
   * @returns {number[]} - Array de IDs de imágenes
   */
  getImageIds(): number[] {
    return [...this.imageIds];
  }

  /**
   * Obtiene el ID del objeto gráfico creado según su índice.
   * Útil para que otros servicios de seed puedan referenciar objetos gráficos.
   *
   * @param {number} index - Índice del objeto gráfico (0-based)
   * @returns {string | undefined} - ID del objeto gráfico o undefined si no existe
   */
  getGraphicObjectId(index: number): string | undefined {
    return this.graphicObjectIds[index];
  }

  /**
   * Obtiene todos los IDs de objetos gráficos creados.
   *
   * @returns {string[]} - Array de IDs de objetos gráficos
   */
  getGraphicObjectIds(): string[] {
    return [...this.graphicObjectIds];
  }
}
