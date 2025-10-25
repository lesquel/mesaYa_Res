import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { GraphicObjectMapper } from '../mappers';
import { UpdateGraphicObjectCommand, GraphicObjectResponseDto } from '../dto';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  type GraphicObjectEventPublisherPort,
} from '../ports';
import { GraphicObjectDomainService } from '../../domain';

@Injectable()
export class UpdateGraphicObjectUseCase
  implements UseCase<UpdateGraphicObjectCommand, GraphicObjectResponseDto>
{
  constructor(
    private readonly graphicObjectDomainService: GraphicObjectDomainService,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: UpdateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    const object = await this.graphicObjectDomainService.updateGraphicObject({
      objectId: command.objectId,
      posX: command.posX,
      posY: command.posY,
      width: command.width,
      height: command.height,
      imageId: command.imageId,
    });
    await this.events.publish({
      type: 'object.updated',
      objectId: object.id,
      occurredAt: new Date(),
      data: { width: object.width, height: object.height },
    });
    return GraphicObjectMapper.toResponse(object);
  }
}
