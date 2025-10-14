import { Injectable, Logger } from '@nestjs/common';
import { GraphicObjectEventPayload } from '../../application/ports/graphic-object-event-publisher.port.js';

@Injectable()
export class GraphicObjectEventNoopProvider {
  private readonly logger = new Logger(GraphicObjectEventNoopProvider.name);

  async publish(event: GraphicObjectEventPayload): Promise<void> {
    this.logger.debug(`GraphicObject event: ${event.type} id=${event.objectId}`);
  }
}
