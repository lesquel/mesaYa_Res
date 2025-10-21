import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { Image } from '../../domain/index.js';
import { ImageMapper } from '../mappers/index.js';
import {
  CreateImageCommand,
  ImageResponseDto,
} from '../dto/index.js';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  IMAGE_STORAGE,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
  type ImageStoragePort,
} from '../ports/index.js';

@Injectable()
export class CreateImageUseCase
  implements UseCase<CreateImageCommand, ImageResponseDto>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
    @Inject(IMAGE_STORAGE)
    private readonly storage: ImageStoragePort,
  ) {}

  async execute(command: CreateImageCommand): Promise<ImageResponseDto> {
    const upload = await this.storage.upload({
      buffer: command.file.buffer,
      contentType: command.file.mimeType,
      originalName: command.file.originalName,
    });

    const image = Image.create({
      url: upload.url,
      storagePath: upload.path,
      title: command.title,
      description: command.description,
      entityId: command.entityId,
    });

    const saved = await this.repo.save(image);
    await this.events.publish({
      type: 'image.created',
      imageId: saved.id,
      occurredAt: new Date(),
      data: { entityId: saved.entityId },
    });

    return ImageMapper.toResponse(saved);
  }
}
