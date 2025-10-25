import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  DeleteGraphicObjectCommand,
  DeleteGraphicObjectResponseDto,
} from '../dto';
import { GraphicObjectMapper } from '../mappers';
import {
  GRAPHIC_OBJECT_EVENT_PUBLISHER,
  type GraphicObjectEventPublisherPort,
} from '../ports';
import { GraphicObjectDomainService } from '../../domain';

@Injectable()
export class DeleteGraphicObjectUseCase
  implements UseCase<DeleteGraphicObjectCommand, DeleteGraphicObjectResponseDto>
{
  constructor(
    private readonly graphicObjectDomainService: GraphicObjectDomainService,
    @Inject(GRAPHIC_OBJECT_EVENT_PUBLISHER)
    private readonly events: GraphicObjectEventPublisherPort,
  ) {}

  async execute(
    command: DeleteGraphicObjectCommand,
  ): Promise<DeleteGraphicObjectResponseDto> {
    const object = await this.graphicObjectDomainService.deleteGraphicObject({
      objectId: command.objectId,
    });
    const graphicObjectResponse = GraphicObjectMapper.toResponse(object);
    await this.events.publish({
      type: 'object.deleted',
      objectId: command.objectId,
      occurredAt: new Date(),
    });
    return { ok: true, graphicObject: graphicObjectResponse };
  }
}
