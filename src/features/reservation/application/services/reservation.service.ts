import { Injectable } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
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
} from '../dto';
import {
  CreateReservationUseCase,
  DeleteReservatioUseCase,
  FindReservationUseCase,
  ListReservationsUseCase,
  ListRestaurantReservationsUseCase,
  UpdateReservationUseCase,
} from '../use-cases';

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

  /**
   * Emits `mesa-ya.reservations.events` with event_type='created' and returns the created reservation DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATIONS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [CreateReservationCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: (entity as { id?: string }).id ?? '',
        data: entity,
        metadata: { user_id: command.userId },
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

  /**
   * Emits `mesa-ya.reservations.events` with event_type='updated' and returns the updated reservation DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATIONS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateReservationCommand];
      const entity = toPlain(result);
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: command.reservationId,
        data: entity,
        metadata: { user_id: command.userId },
      };
    },
  })
  async update(
    command: UpdateReservationCommand,
  ): Promise<ReservationResponseDto> {
    return this.updateReservationUseCase.execute(command);
  }

  /**
   * Emits `mesa-ya.reservations.events` with event_type='deleted' and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.RESERVATIONS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteReservationCommand];
      const { reservation } = result as DeleteReservationResponseDto;
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: reservation.id,
        data: toPlain(reservation),
        metadata: { user_id: command.userId },
      };
    },
  })
  async delete(
    command: DeleteReservationCommand,
  ): Promise<DeleteReservationResponseDto> {
    return this.deleteReservationUseCase.execute(command);
  }
}
