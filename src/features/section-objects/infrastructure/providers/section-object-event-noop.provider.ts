import { Injectable, Logger } from '@nestjs/common';
import {
  type SectionObjectEventPublisherPort,
  type SectionObjectEventPayload,
} from '../../application/ports/index.js';

@Injectable()
export class SectionObjectEventNoopProvider
  implements SectionObjectEventPublisherPort
{
  private readonly logger = new Logger(SectionObjectEventNoopProvider.name);
  async publish(event: SectionObjectEventPayload): Promise<void> {
    this.logger.log(
      `SectionObject event: ${event.type} id=${event.sectionObjectId}`,
    );
  }
}
