import { Injectable } from '@nestjs/common';
import {
  CreateBookingCommand,
  DeleteBookingCommand,
  FindBookingQuery,
  ListBookingsQuery,
  ListRestaurantBookingsQuery,
  BookingResponseDto,
  DeleteBookingResponseDto,
  PaginatedBookingResponse,
} from '../dto/index.js';
import {
  CreateBookingUseCase,
  DeleteBookingUseCase,
  FindBookingUseCase,
  ListBookingsUseCase,
  ListRestaurantBookingsUseCase,
  UpdateBookingUseCase,
} from '../use-cases/index.js';

@Injectable()
export class BookingsService {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly listBookingsUseCase: ListBookingsUseCase,
    private readonly listRestaurantBookingsUseCase: ListRestaurantBookingsUseCase,
    private readonly findBookingUseCase: FindBookingUseCase,
    private readonly updateBookingUseCase: UpdateBookingUseCase,
    private readonly deleteBookingUseCase: DeleteBookingUseCase,
  ) {}

  async create(command: CreateBookingCommand): Promise<BookingResponseDto> {
    return this.createBookingUseCase.execute(command);
  }

  async list(query: ListBookingsQuery): Promise<PaginatedBookingResponse> {
    return this.listBookingsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantBookingsQuery,
  ): Promise<PaginatedBookingResponse> {
    return this.listRestaurantBookingsUseCase.execute(query);
  }

  async findOne(query: FindBookingQuery): Promise<BookingResponseDto> {
    return this.findBookingUseCase.execute(query);
  }

  async update(command: any): Promise<BookingResponseDto> {
    return this.updateBookingUseCase.execute(command);
  }

  async delete(
    command: DeleteBookingCommand,
  ): Promise<DeleteBookingResponseDto> {
    return this.deleteBookingUseCase.execute(command);
  }
}
