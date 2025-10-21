import { Injectable, Logger } from '@nestjs/common';
import {
  type ImageEventPayload,
  type ImageEventPublisherPort,
} from '../../application/ports/index.js';

@Injectable()
export class ImageEventNoopProvider implements ImageEventPublisherPort {
  private readonly logger = new Logger(ImageEventNoopProvider.name);

  async publish(event: ImageEventPayload): Promise<void> {
    this.logger.log(`Image event: ${event.type} id=${event.imageId}`);
  }
}
