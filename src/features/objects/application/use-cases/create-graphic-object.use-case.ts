import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { GraphicObject } from '../../domain/index';
import { GraphicObjectMapper } from '../mappers/index';
import {
  CreateGraphicObjectCommand,
  GraphicObjectResponseDto,
} from '../dto/index';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  GRAPHIC_OBJECT_REPOSITORY,
  type GraphicObjectEventPublisherPort,
  type GraphicObjectRepositoryPort,
} from '../ports/index';

@Injectable()
export class CreateGraphicObjectUseCase
  implements UseCase<CreateGraphicObjectCommand, GraphicObjectResponseDto>
{
  constructor(
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly repo: GraphicObjectRepositoryPort,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: CreateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    const object = GraphicObject.create(randomUUID(), {
      posX: command.posX,
      posY: command.posY,
      width: command.width,
      height: command.height,
      imageId: command.imageId,
    });
    const saved = await this.repo.save(object);
    await this.events.publish({
      type: 'object.created',
      objectId: saved.id,
      occurredAt: new Date(),
      data: { width: saved.width, height: saved.height },
    });
    return GraphicObjectMapper.toResponse(saved);
  }
}
