import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { Image } from '../../domain/index';
import { ImageMapper } from '../mappers/index';
import { CreateImageCommand, ImageResponseDto } from '../dto/index';
import {
  IMAGE_EVENT_PUBLISHER,
  IMAGE_REPOSITORY,
  type ImageEventPublisherPort,
  type ImageRepositoryPort,
} from '../ports/index';

@Injectable()
export class CreateImageUseCase
  implements UseCase<CreateImageCommand, ImageResponseDto>
{
  constructor(
    @Inject(IMAGE_REPOSITORY)
    private readonly repo: ImageRepositoryPort,
    @Inject(IMAGE_EVENT_PUBLISHER)
    private readonly events: ImageEventPublisherPort,
  ) {}

  async execute(command: CreateImageCommand): Promise<ImageResponseDto> {
    const image = Image.create({
      url: command.url,
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
