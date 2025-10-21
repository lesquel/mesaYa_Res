import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { randomUUID } from 'crypto';
import { GraphicObjectMapper } from '../mappers/index';
import {
  CreateGraphicObjectCommand,
  GraphicObjectResponseDto,
} from '../dto/index';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  type GraphicObjectEventPublisherPort,
} from '../ports/index';
import { GraphicObjectDomainService } from '../../domain/index';

@Injectable()
export class CreateGraphicObjectUseCase
  implements UseCase<CreateGraphicObjectCommand, GraphicObjectResponseDto>
{
  constructor(
    private readonly graphicObjectDomainService: GraphicObjectDomainService,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: CreateGraphicObjectCommand,
  ): Promise<GraphicObjectResponseDto> {
    const object = await this.graphicObjectDomainService.createGraphicObject({
      objectId: randomUUID(),
      posX: command.posX,
      posY: command.posY,
      width: command.width,
      height: command.height,
      imageId: command.imageId,
    });
    await this.events.publish({
      type: 'object.created',
      objectId: object.id,
      occurredAt: new Date(),
      data: { width: object.width, height: object.height },
    });
    return GraphicObjectMapper.toResponse(object);
  }
}
