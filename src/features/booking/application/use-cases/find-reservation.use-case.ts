import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { ReservationNotFoundError } from '../../domain';
import { FindReservationQuery, ReservationResponseDto } from '../dto/index.js';
import { ReservationMapper } from '../mappers/index.js';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepositoryPort,
} from '../ports/index.js';

@Injectable()
export class FindReservationUseCase
  implements UseCase<FindReservationQuery, ReservationResponseDto>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly bookingRepository: ReservationRepositoryPort,
  ) {}

  async execute(query: FindReservationQuery): Promise<ReservationResponseDto> {
    const booking = await this.bookingRepository.findById(query.bookingId);

    if (!booking) {
      throw new ReservationNotFoundError(query.bookingId);
    }

    return ReservationMapper.toResponse(booking);
  }
}
