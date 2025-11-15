import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  UpdateOwnerReservationCommand,
  ReservationResponseDto,
} from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports';
import { ReservationOwnerAccessService } from '../services';
import {
  ReservationDomainService,
  IReservationRepositoryPort,
} from '../../domain';
import { ReservationNotFoundError } from '../../domain/errors';

@Injectable()
export class UpdateOwnerReservationUseCase
  implements UseCase<UpdateOwnerReservationCommand, ReservationResponseDto>
{
  constructor(
    private readonly ownerAccess: ReservationOwnerAccessService,
    private readonly reservationDomainService: ReservationDomainService,
    private readonly reservationRepository: IReservationRepositoryPort,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: UpdateOwnerReservationCommand,
  ): Promise<ReservationResponseDto> {
    await this.ownerAccess.assertReservationOwnership(
      command.reservationId,
      command.ownerId,
    );

    const reservation = await this.reservationRepository.findById(
      command.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(command.reservationId);
    }

    const updated = await this.reservationDomainService.updateReservation({
      reservationId: command.reservationId,
      userId: reservation.userId,
      reservationDate: command.reservationDate
        ? new Date(command.reservationDate as unknown as string)
        : undefined,
      reservationTime: command.reservationTime
        ? new Date(command.reservationTime as unknown as string)
        : undefined,
      numberOfGuests: command.numberOfGuests,
    });

    await this.eventPublisher.publish({
      type: 'reservation.updated',
      reservationId: updated.id,
      restaurantId: updated.restaurantId,
      userId: updated.userId,
      occurredAt: new Date(),
      data: {
        updatedBy: 'owner',
        ownerId: command.ownerId,
      },
    });

    return ReservationMapper.toResponse(updated);
  }
}
