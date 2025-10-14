import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import {
  Reservation,
  ReservationRestaurantNotFoundError,
  ReservationUserNotFoundError,
} from '../../domain';
import { randomUUID } from 'crypto';
import { ReservationMapper } from '../mappers/index.js';
import {
  ReservationResponseDto,
  CreateReservationCommand,
} from '../dto/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  RESTAURANT_BOOKING_READER,
  type RestaurantReservationReaderPort,
  USER_BOOKING_READER,
  type UserBookingReaderPort,
  BOOKING_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index.js';

@Injectable()
export class CreateReservationUseCase
  implements UseCase<CreateReservationCommand, ReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly bookingRepository: ReservationRepositoryPort,
    @Inject(RESTAURANT_BOOKING_READER)
    private readonly restaurantReader: RestaurantReservationReaderPort,
    @Inject(USER_BOOKING_READER)
    private readonly userReader: UserBookingReaderPort,
    @Inject(BOOKING_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: CreateReservationCommand,
  ): Promise<ReservationResponseDto> {
    const restaurantExists = await this.restaurantReader.exists(
      command.restaurantId,
    );
    if (!restaurantExists) {
      throw new ReservationRestaurantNotFoundError(command.restaurantId);
    }

    const userExists = await this.userReader.exists(command.userId);
    if (!userExists) {
      throw new ReservationUserNotFoundError(command.userId);
    }

    const booking = Reservation.create(randomUUID(), {
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
    return ReservationMapper.toResponse(saved);
  }
}
