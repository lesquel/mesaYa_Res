import { Injectable, Logger } from '@nestjs/common';
import {
  type ReservationEventPayload,
  type ReservationEventPublisherPort,
} from '../../application/ports/index.js';

@Injectable()
export class ReservationEventNoopProvider
  implements ReservationEventPublisherPort
{
  private readonly logger = new Logger(ReservationEventNoopProvider.name);

  async publish(event: ReservationEventPayload): Promise<void> {
    // Placeholder for Kafka or other event buses. Keeps architecture ready.
    this.logger.debug(`Booking event published (noop): ${event.type}`, event);
  }
}
