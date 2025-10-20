import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { GraphicObjectNotFoundError } from '../../domain/index';
import { GraphicObjectMapper } from '../mappers/index';
import {
  UpdateGraphicObjectCommand,
  GraphicObjectResponseDto,
} from '../dto/index';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  GRAPHIC_OBJECT_REPOSITORY,
  type GraphicObjectEventPublisherPort,
  type GraphicObjectRepositoryPort,
} from '../ports/index';

@Injectable()
export class UpdateGraphicObjectUseCase
  implements UseCase<UpdateGraphicObjectCommand, GraphicObjectResponseDto>
{
  constructor(
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly repo: GraphicObjectRepositoryPort,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: UpdateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    const object = await this.repo.findById(command.objectId);
    if (!object) throw new GraphicObjectNotFoundError(command.objectId);
    const { objectId, ...patch } = command as any;
    object.update(patch);
    const saved = await this.repo.save(object);
    await this.events.publish({
      type: 'object.updated',
      objectId: saved.id,
      occurredAt: new Date(),
      data: { width: saved.width, height: saved.height },
    });
    return GraphicObjectMapper.toResponse(saved);
  }
}
