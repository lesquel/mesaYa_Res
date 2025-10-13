import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  Booking,
  BookingRestaurantNotFoundError,
  BookingUserNotFoundError,
} from '../../domain';
import { randomUUID } from 'crypto';
import { BookingMapper } from '../mappers/index.js';
import { BookingResponseDto, CreateBookingCommand } from '../dto/index.js';
import {
  BOOKING_REPOSITORY,
  type BookingRepositoryPort,
  RESTAURANT_BOOKING_READER,
  type RestaurantBookingReaderPort,
  USER_BOOKING_READER,
  type UserBookingReaderPort,
  BOOKING_EVENT_PUBLISHER,
  type BookingEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class CreateBookingUseCase
  implements UseCase<CreateBookingCommand, BookingResponseDto>
{
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepositoryPort,
    @Inject(RESTAURANT_BOOKING_READER)
    private readonly restaurantReader: RestaurantBookingReaderPort,
    @Inject(USER_BOOKING_READER)
    private readonly userReader: UserBookingReaderPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: BookingEventPublisherPort,
  ) {}

  async execute(command: CreateBookingCommand): Promise<BookingResponseDto> {
    const restaurantExists = await this.restaurantReader.exists(
      command.restaurantId,
    );
    if (!restaurantExists) {
      throw new BookingRestaurantNotFoundError(command.restaurantId);
    }

    const userExists = await this.userReader.exists(command.userId);
    if (!userExists) {
      throw new BookingUserNotFoundError(command.userId);
    }

    const booking = Booking.create(randomUUID(), {
      userId: command.userId,
      restaurantId: command.restaurantId,
      tableId: command.tableId,
      reservationDate: new Date(command.reservationDate),
      reservationTime: new Date(command.reservationTime),
      numberOfGuests: command.numberOfGuests,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING',
    });

    const saved = await this.bookingRepository.save(booking);
    await this.eventPublisher.publish({
      type: 'booking.created',
      bookingId: saved.id,
      restaurantId: saved.restaurantId,
      userId: saved.userId,
      occurredAt: new Date(),
      data: { numberOfGuests: saved.numberOfGuests },
    });
    return BookingMapper.toResponse(saved);
  }
}
