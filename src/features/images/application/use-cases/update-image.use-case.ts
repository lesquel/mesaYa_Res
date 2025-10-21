import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ImageNotFoundError } from '../../domain/index.js';
import { ImageMapper } from '../mappers/index.js';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
} from '../ports/index.js';
import {
  ImageResponseDto,
  UpdateImageCommand,
} from '../dto/index.js';

@Injectable()
export class UpdateImageUseCase
  implements UseCase<UpdateImageCommand, ImageResponseDto>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
  ) {}

  async execute(command: UpdateImageCommand): Promise<ImageResponseDto> {
    const image = await this.repo.findById(command.imageId);
    if (!image) throw new ImageNotFoundError(command.imageId);

    image.update({
      url: command.url,
      title: command.title,
      description: command.description,
      entityId: command.entityId,
    });

    const saved = await this.repo.save(image);
    await this.events.publish({
      type: 'image.updated',
      imageId: saved.id,
      occurredAt: new Date(),
      data: { entityId: saved.entityId },
    });

    return ImageMapper.toResponse(saved);
  }
}
