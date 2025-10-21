import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ImageNotFoundError } from '../../domain/index.js';
import { ImageMapper } from '../mappers/index.js';
import {
  DeleteImageCommand,
  DeleteImageResponseDto,
} from '../dto/index.js';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class DeleteImageUseCase
  implements UseCase<DeleteImageCommand, DeleteImageResponseDto>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
  ) {}

  async execute(command: DeleteImageCommand): Promise<DeleteImageResponseDto> {
    const image = await this.repo.findById(command.imageId);
    if (!image) throw new ImageNotFoundError(command.imageId);

    const imageResponse = ImageMapper.toResponse(image);

    await this.repo.delete(command.imageId);
    await this.events.publish({
      type: 'image.deleted',
      imageId: command.imageId,
      occurredAt: new Date(),
      data: { entityId: imageResponse.entityId },
    });

    return { ok: true, image: imageResponse };
  }
}
