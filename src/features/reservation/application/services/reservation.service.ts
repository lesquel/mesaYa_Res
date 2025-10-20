import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
} from '../../../../shared/infrastructure/kafka/index.js';
import type {
  CreateReservationCommand,
  DeleteReservationCommand,
  FindReservationQuery,
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
  ReservationResponseDto,
  DeleteReservationResponseDto,
  PaginatedReservationResponse,
  UpdateReservationCommand,
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
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATION_CREATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateReservationCommand];
      return {
        action: 'reservation.created',
        entity: toPlain(result),
        performedBy: command.userId,
      };
    },
  })
  async create(
    command: CreateReservationCommand,
  ): Promise<ReservationResponseDto> {
    return this.createReservationUseCase.execute(command);
  }

  async list(
    query: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    return this.listReservationsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    return this.listRestaurantReservationsUseCase.execute(query);
  }

  async findOne(query: FindReservationQuery): Promise<ReservationResponseDto> {
    return this.findReservationUseCase.execute(query);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATION_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateReservationCommand];
      return {
        action: 'reservation.updated',
        entityId: command.reservationId,
        entity: toPlain(result),
        performedBy: command.userId,
      };
    },
  })
  async update(
    command: UpdateReservationCommand,
  ): Promise<ReservationResponseDto> {
    return this.updateReservationUseCase.execute(command);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATION_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteReservationCommand];
      const { reservation } = result as DeleteReservationResponseDto;
      return {
        action: 'reservation.deleted',
        entityId: reservation.id,
        performedBy: command.userId,
        entity: toPlain(reservation),
      };
    },
  })
  async delete(
    command: DeleteReservationCommand,
  ): Promise<DeleteReservationResponseDto> {
    return this.deleteReservationUseCase.execute(command);
  }
}
