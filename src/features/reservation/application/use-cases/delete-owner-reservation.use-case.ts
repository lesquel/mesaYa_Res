import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import {
  DeleteOwnerReservationCommand,
  DeleteReservationResponseDto,
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
export class DeleteOwnerReservationUseCase
  implements
    UseCase<DeleteOwnerReservationCommand, DeleteReservationResponseDto>
{
  constructor(
    private readonly ownerAccess: ReservationOwnerAccessService,
    private readonly reservationDomainService: ReservationDomainService,
    private readonly reservationRepository: IReservationRepositoryPort,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: DeleteOwnerReservationCommand,
  ): Promise<DeleteReservationResponseDto> {
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

    const deleted = await this.reservationDomainService.cancelReservation({
      reservationId: reservation.id,
      userId: reservation.userId,
    });

    const reservationResponse = ReservationMapper.toResponse(deleted);

    await this.eventPublisher.publish({
      type: 'reservation.deleted',
      reservationId: reservationResponse.id,
      restaurantId: reservationResponse.restaurantId,
      userId: reservationResponse.userId,
      occurredAt: new Date(),
      data: {
        deletedBy: 'owner',
        ownerId: command.ownerId,
      },
    });

    return { ok: true, reservation: reservationResponse };
  }
}
