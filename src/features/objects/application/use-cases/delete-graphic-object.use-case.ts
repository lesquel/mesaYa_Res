import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { GraphicObjectNotFoundError } from '../../domain/index';
import {
  DeleteGraphicObjectCommand,
  DeleteGraphicObjectResponseDto,
} from '../dto/index';
import { GraphicObjectMapper } from '../mappers/index';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  GRAPHIC_OBJECT_REPOSITORY,
  type GraphicObjectEventPublisherPort,
  type GraphicObjectRepositoryPort,
} from '../ports/index';

@Injectable()
export class DeleteGraphicObjectUseCase
  implements UseCase<DeleteGraphicObjectCommand, DeleteGraphicObjectResponseDto>
{
  constructor(
    @Inject(GRAPHIC_OBJECT_REPOSITORY)
    private readonly repo: GraphicObjectRepositoryPort,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: DeleteGraphicObjectCommand,
  ): Promise<DeleteGraphicObjectResponseDto> {
    const object = await this.repo.findById(command.objectId);
    if (!object) throw new GraphicObjectNotFoundError(command.objectId);
    const graphicObjectResponse = GraphicObjectMapper.toResponse(object);

    await this.repo.delete(command.objectId);
    await this.events.publish({
      type: 'object.deleted',
      objectId: command.objectId,
      occurredAt: new Date(),
    });
    return { ok: true, graphicObject: graphicObjectResponse };
  }
}
