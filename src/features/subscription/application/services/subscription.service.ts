import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
} from '@shared/infrastructure/kafka';
import {
  CreateSubscriptionUseCase,
  DeleteSubscriptionUseCase,
  GetSubscriptionByIdUseCase,
  ListSubscriptionsUseCase,
  UpdateSubscriptionStateUseCase,
  UpdateSubscriptionUseCase,
} from '../use-cases';
import type {
  CreateSubscriptionDto,
  DeleteSubscriptionDto,
  GetSubscriptionByIdDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionStateDto,
} from '../dtos/input';
import type {
  DeleteSubscriptionResponseDto,
  SubscriptionListResponseDto,
  SubscriptionResponseDto,
} from '../dtos/output';
import {
  ISubscriptionRepositoryPort,
  SubscriptionDomainService,
} from '@features/subscription/domain';
import { SubscriptionMapper } from '../mappers';
export class SubscriptionService {
  private readonly subscriptionDomainService: SubscriptionDomainService;

  private readonly createSubscriptionUseCase: CreateSubscriptionUseCase;
  private readonly getSubscriptionByIdUseCase: GetSubscriptionByIdUseCase;
  private readonly listSubscriptionsUseCase: ListSubscriptionsUseCase;
  private readonly updateSubscriptionUseCase: UpdateSubscriptionUseCase;
  private readonly updateSubscriptionStateUseCase: UpdateSubscriptionStateUseCase;
  private readonly deleteSubscriptionUseCase: DeleteSubscriptionUseCase;

  constructor(
    private readonly logger: ILoggerPort,
    subscriptionRepository: ISubscriptionRepositoryPort,
    subscriptionMapper: SubscriptionMapper,
    private readonly kafkaService: KafkaService,
  ) {
    this.subscriptionDomainService = new SubscriptionDomainService(
      subscriptionRepository,
    );

    this.createSubscriptionUseCase = new CreateSubscriptionUseCase(
      this.logger,
      this.subscriptionDomainService,
      subscriptionMapper,
    );

    this.getSubscriptionByIdUseCase = new GetSubscriptionByIdUseCase(
      this.logger,
      this.subscriptionDomainService,
      subscriptionMapper,
    );

    this.listSubscriptionsUseCase = new ListSubscriptionsUseCase(
      this.logger,
      subscriptionRepository,
      subscriptionMapper,
    );

    this.updateSubscriptionUseCase = new UpdateSubscriptionUseCase(
      this.logger,
      this.subscriptionDomainService,
      subscriptionMapper,
    );

    this.updateSubscriptionStateUseCase = new UpdateSubscriptionStateUseCase(
      this.logger,
      this.subscriptionDomainService,
      subscriptionMapper,
    );

    this.deleteSubscriptionUseCase = new DeleteSubscriptionUseCase(
      this.logger,
      this.subscriptionDomainService,
    );
  }

  /**
   * Emits `mesa-ya.subscriptions.created` with `{ action, entityId, entity }` and returns the created subscription DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_CREATED,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId =
        (entity as { subscriptionId?: string }).subscriptionId ?? null;
      return {
        action: 'subscription.created',
        entityId,
        entity,
      };
    },
  })
  async create(dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.createSubscriptionUseCase.execute(dto);
  }

  async findById(
    dto: GetSubscriptionByIdDto,
  ): Promise<SubscriptionResponseDto> {
    return this.getSubscriptionByIdUseCase.execute(dto);
  }

  async findAll(
    params: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    return this.listSubscriptionsUseCase.execute(params);
  }

  /**
   * Emits `mesa-ya.subscriptions.updated` with `{ action, entityId, entity }` and returns the updated subscription DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSubscriptionDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.subscriptionId as string | undefined) ||
        (entity as { subscriptionId?: string }).subscriptionId ||
        null;
      return {
        action: 'subscription.updated',
        entityId,
        entity,
      };
    },
  })
  async update(dto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.updateSubscriptionUseCase.execute(dto);
  }

  /**
   * Emits `mesa-ya.subscriptions.updated` with `{ action, entityId, state, entity }` and returns the updated subscription DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSubscriptionStateDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.subscriptionId as string | undefined) ||
        (entity as { subscriptionId?: string }).subscriptionId ||
        null;
      return {
        action: 'subscription.state.updated',
        entityId,
        state:
          (entity as { stateSubscription?: unknown }).stateSubscription ??
          command?.stateSubscription ??
          null,
        entity,
      };
    },
  })
  async updateState(
    dto: UpdateSubscriptionStateDto,
  ): Promise<SubscriptionResponseDto> {
    return this.updateSubscriptionStateUseCase.execute(dto);
  }

  /**
   * Emits `mesa-ya.subscriptions.deleted` with `{ action, entityId, entity }` and returns the deletion snapshot DTO.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteSubscriptionDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { subscriptionId?: string }).subscriptionId ||
        command?.subscriptionId ||
        null;
      return {
        action: 'subscription.deleted',
        entityId,
        entity: deletion,
      };
    },
  })
  async delete(
    dto: DeleteSubscriptionDto,
  ): Promise<DeleteSubscriptionResponseDto> {
    return this.deleteSubscriptionUseCase.execute(dto);
  }
}
