import { Inject, Injectable, Logger } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ImageNotFoundError } from '../../domain/index';
import { ImageMapper } from '../mappers/index';
import { DeleteImageCommand, DeleteImageResponseDto } from '../dto/index';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  IMAGE_STORAGE,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
  type ImageStoragePort,
} from '../ports/index';

@Injectable()
export class DeleteImageUseCase
  implements UseCase<DeleteImageCommand, DeleteImageResponseDto>
{
  private readonly logger = new Logger(DeleteImageUseCase.name);

  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
    @Inject(IMAGE_STORAGE)
    private readonly storage: ImageStoragePort,
  ) {}

  async execute(command: DeleteImageCommand): Promise<DeleteImageResponseDto> {
    const image = await this.repo.findById(command.imageId);
    if (!image) throw new ImageNotFoundError(command.imageId);

    const imageResponse = ImageMapper.toResponse(image);

    await this.repo.delete(command.imageId);
    try {
      await this.storage.remove(image.storagePath);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to remove image from storage (path=${image.storagePath}): ${reason}`,
      );
    }
    await this.events.publish({
      type: 'image.deleted',
      imageId: command.imageId,
      occurredAt: new Date(),
      data: { entityId: imageResponse.entityId },
    });

    return { ok: true, image: imageResponse };
  }
}
