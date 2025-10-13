import { Injectable, Logger } from '@nestjs/common';
import {
  type BookingEventPayload,
  type BookingEventPublisherPort,
} from '../../application/ports/index.js';

@Injectable()
export class BookingEventNoopProvider implements BookingEventPublisherPort {
  private readonly logger = new Logger(BookingEventNoopProvider.name);

  async publish(event: BookingEventPayload): Promise<void> {
    // Placeholder for Kafka or other event buses. Keeps architecture ready.
    this.logger.debug(`Booking event published (noop): ${event.type}`, event);
  }
}
