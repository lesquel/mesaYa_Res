import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port';
import { ReservationNotFoundError } from '../../domain';
import { FindReservationQuery, ReservationResponseDto } from '../dto';
import { ReservationMapper } from '../mappers';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports';

@Injectable()
export class FindReservationUseCase
  implements UseCase<FindReservationQuery, ReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
  ) {}

  async execute(query: FindReservationQuery): Promise<ReservationResponseDto> {
    const reservation = await this.reservationRepository.findById(
      query.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(query.reservationId);
    }

    return ReservationMapper.toResponse(reservation);
  }
}
