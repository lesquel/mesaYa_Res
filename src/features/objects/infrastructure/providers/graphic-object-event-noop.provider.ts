import { Injectable, Logger } from '@nestjs/common';
import {
  type GraphicObjectEventPublisherPort,
  type GraphicObjectEventPayload,
} from '../../application/ports';

@Injectable()
export class GraphicObjectEventNoopProvider
  implements GraphicObjectEventPublisherPort
{
  private readonly logger = new Logger(GraphicObjectEventNoopProvider.name);
  async publish(event: GraphicObjectEventPayload): Promise<void> {
    this.logger.log(`GraphicObject event: ${event.type} id=${event.objectId}`);
  }
}
