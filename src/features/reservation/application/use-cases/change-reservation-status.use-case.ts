import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ChangeReservationStatusCommand, ReservationResponseDto } from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_EVENT_PUBLISHER,
  type ReservationEventPublisherPort,
} from '../ports';
import { ReservationDomainService } from '../../domain/services/reservation-domain.service';
import { ReservationOwnerAccessService } from '../services/reservation-owner-access.service';

@Injectable()
export class ChangeReservationStatusUseCase
  implements UseCase<ChangeReservationStatusCommand, ReservationResponseDto>
{
  constructor(
    private readonly reservationDomainService: ReservationDomainService,
    private readonly ownerAccess: ReservationOwnerAccessService,
    @Inject(RESERVATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ReservationEventPublisherPort,
  ) {}

  async execute(
    command: ChangeReservationStatusCommand,
  ): Promise<ReservationResponseDto> {
    if (command.enforceOwnership) {
      if (!command.ownerId) {
        throw new Error('Owner ID is required to enforce ownership');
      }
      await this.ownerAccess.assertReservationOwnership(
        command.reservationId,
        command.ownerId,
      );
    }

    const updated = await this.reservationDomainService.changeReservationStatus(
      {
        reservationId: command.reservationId,
        status: command.status,
      },
    );

    const eventData: Record<string, unknown> = {
      status: updated.status,
      updatedBy: command.actor,
    };

    if (command.ownerId) {
      eventData.ownerId = command.ownerId;
    }
    if (command.reason) {
      eventData.reason = command.reason;
    }
    if (typeof command.notifyCustomer === 'boolean') {
      eventData.notifyCustomer = command.notifyCustomer;
    }

    await this.eventPublisher.publish({
      type: 'reservation.updated',
      reservationId: updated.id,
      restaurantId: updated.restaurantId,
      userId: updated.userId,
      occurredAt: new Date(),
      data: eventData,
    });

    return ReservationMapper.toResponse(updated);
  }
}
