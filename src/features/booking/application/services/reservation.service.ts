import { Injectable } from '@nestjs/common';
import {
  CreateReservationCommand,
  DeleteReservationCommand,
  FindReservationQuery,
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
  ReservationResponseDto,
  DeleteBookingResponseDto,
  PaginatedBookingResponse,
} from '../dto/index.js';
import {
  CreateReservationUseCase,
  DeleteReservatioUseCase,
  FindReservationUseCase,
  ListReservationsUseCase,
  ListRestaurantReservationsUseCase,
  UpdateReservationUseCase,
} from '../use-cases/index.js';

@Injectable()
export class ReservationService {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly listRestaurantReservationsUseCase: ListRestaurantReservationsUseCase,
    private readonly findReservationUseCase: FindReservationUseCase,
    private readonly updateReservationUseCase: UpdateReservationUseCase,
    private readonly deleteReservationUseCase: DeleteReservatioUseCase,
  ) {}

  async create(
    command: CreateReservationCommand,
  ): Promise<ReservationResponseDto> {
    return this.createReservationUseCase.execute(command);
  }

  async list(query: ListReservationsQuery): Promise<PaginatedBookingResponse> {
    return this.listReservationsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedBookingResponse> {
    return this.listRestaurantReservationsUseCase.execute(query);
  }

  async findOne(query: FindReservationQuery): Promise<ReservationResponseDto> {
    return this.findReservationUseCase.execute(query);
  }

  async update(command: any): Promise<ReservationResponseDto> {
    return this.updateReservationUseCase.execute(command);
  }

  async delete(
    command: DeleteReservationCommand,
  ): Promise<DeleteBookingResponseDto> {
    return this.deleteReservationUseCase.execute(command);
  }
}
