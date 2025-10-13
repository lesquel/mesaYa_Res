import { Injectable, Logger } from '@nestjs/common';
import { type TableEventPayload, type TableEventPublisherPort } from '../../application/ports/index.js';

@Injectable()
export class TableEventNoopProvider implements TableEventPublisherPort {
  private readonly logger = new Logger(TableEventNoopProvider.name);

  async publish(event: TableEventPayload): Promise<void> {
    this.logger.debug(`Table event (noop): ${event.type}`, event);
  }
}
