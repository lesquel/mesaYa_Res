import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  IMAGE_STORAGE,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
  type ImageStoragePort,
} from '../ports/index';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ImageNotFoundError } from '../../domain/index';
import { ImageMapper } from '../mappers/index';
import { ImageResponseDto, UpdateImageCommand } from '../dto/index';

@Injectable()
export class UpdateImageUseCase
  implements UseCase<UpdateImageCommand, ImageResponseDto>
{
  private readonly logger = new Logger(UpdateImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
    @Inject(IMAGE_STORAGE)
    private readonly storage: ImageStoragePort,
  ) {}

  async execute(command: UpdateImageCommand): Promise<ImageResponseDto> {
    const image = await this.repo.findById(command.imageId);
    if (!image) throw new ImageNotFoundError(command.imageId);

    let previousPath: string | null = null;
    let uploadResult: { url: string; path: string } | undefined;

    if (command.file) {
      previousPath = image.storagePath;
      uploadResult = await this.storage.upload({
        buffer: command.file.buffer,
        contentType: command.file.mimeType,
        originalName: command.file.originalName,
      });
    }

    image.update({
      ...(uploadResult
        ? { url: uploadResult.url, storagePath: uploadResult.path }
        : {}),
      title: command.title,
      description: command.description,
      entityId: command.entityId,
    });

    const saved = await this.repo.save(image);

    if (previousPath) {
      try {
        await this.storage.remove(previousPath);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to remove previous image from storage: ${previousPath} (${reason})`,
        );
      }
    }

    await this.events.publish({
      type: 'image.updated',
      imageId: saved.id,
      occurredAt: new Date(),
      data: { entityId: saved.entityId },
    });

    return ImageMapper.toResponse(saved);
  }
}
