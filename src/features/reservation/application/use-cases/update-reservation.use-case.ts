import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  ReservationEntity,
  ReservationNotFoundError,
  ReservationOwnershipError,
} from '../../domain';
import { UpdateReservationCommand, ReservationResponseDto } from '../dto/index';
import { ReservationMapper } from '../mappers/index';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports/index';

@Injectable()
export class UpdateReservationUseCase
  implements UseCase<UpdateReservationCommand, ReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: UpdateReservationCommand,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.reservationRepository.findById(
      command.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(command.reservationId);
    }

    if (reservation.userId !== command.userId) {
      throw new ReservationOwnershipError();
    }

    const updateData = {
      ...(command.reservationDate !== undefined && {
        reservationDate: command.reservationDate
          ? new Date(command.reservationDate as unknown as string)
          : undefined,
      }),
      ...(command.reservationTime !== undefined && {
        reservationTime: command.reservationTime
          ? new Date(command.reservationTime as unknown as string)
          : undefined,
      }),
      ...(command.numberOfGuests !== undefined && {
        numberOfGuests: command.numberOfGuests,
      }),
      // status updates are not supported via this command
    };

    reservation.update(updateData);
    const saved = await this.reservationRepository.save(reservation);
    await this.eventPublisher.publish({
      type: 'reservation.updated',
      reservationId: saved.id,
      restaurantId: saved.restaurantId,
      userId: saved.userId,
      occurredAt: new Date(),
      data: { numberOfGuests: saved.numberOfGuests },
    });
    return ReservationMapper.toResponse(saved);
  }
}
