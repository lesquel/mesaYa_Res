import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import {
  CreateSubscriptionPlanUseCase,
  DeleteSubscriptionPlanUseCase,
  GetSubscriptionPlanByIdUseCase,
  ListSubscriptionPlansUseCase,
  UpdateSubscriptionPlanUseCase,
} from '../use-cases';
import type {
  CreateSubscriptionPlanDto,
  DeleteSubscriptionPlanDto,
  GetSubscriptionPlanByIdDto,
  UpdateSubscriptionPlanDto,
} from '../dtos/input';
import type {
  DeleteSubscriptionPlanResponseDto,
  SubscriptionPlanListResponseDto,
  SubscriptionPlanResponseDto,
} from '../dtos/output';
import {
  ISubscriptionPlanRepositoryPort,
  SubscriptionPlanDomainService,
} from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
export class SubscriptionPlanService {
  private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService;

  private readonly createSubscriptionPlanUseCase: CreateSubscriptionPlanUseCase;
  private readonly getSubscriptionPlanByIdUseCase: GetSubscriptionPlanByIdUseCase;
  private readonly listSubscriptionPlansUseCase: ListSubscriptionPlansUseCase;
  private readonly updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase;
  private readonly deleteSubscriptionPlanUseCase: DeleteSubscriptionPlanUseCase;

  constructor(
    private readonly logger: ILoggerPort,
    subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
    subscriptionPlanMapper: SubscriptionPlanMapper,
    private readonly kafkaService: KafkaService,
  ) {
    this.subscriptionPlanDomainService = new SubscriptionPlanDomainService(
      subscriptionPlanRepository,
    );

    this.createSubscriptionPlanUseCase = new CreateSubscriptionPlanUseCase(
      this.logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.getSubscriptionPlanByIdUseCase = new GetSubscriptionPlanByIdUseCase(
      this.logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.listSubscriptionPlansUseCase = new ListSubscriptionPlansUseCase(
      this.logger,
      subscriptionPlanRepository,
      subscriptionPlanMapper,
    );

    this.updateSubscriptionPlanUseCase = new UpdateSubscriptionPlanUseCase(
      this.logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.deleteSubscriptionPlanUseCase = new DeleteSubscriptionPlanUseCase(
      this.logger,
      this.subscriptionPlanDomainService,
    );
  }

  /**
   * Emits `mesa-ya.subscriptions.events` with event_type='created' and entity_subtype='plan'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTIONS,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId =
        (entity as { subscriptionPlanId?: string }).subscriptionPlanId ?? '';
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: entityId,
        entity_subtype: 'plan',
        data: entity,
      };
    },
  })
  async create(
    dto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.createSubscriptionPlanUseCase.execute(dto);
  }

  async findById(
    dto: GetSubscriptionPlanByIdDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.getSubscriptionPlanByIdUseCase.execute(dto);
  }

  async findAll(
    params: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    return this.listSubscriptionPlansUseCase.execute(params);
  }

  /**
   * Emits `mesa-ya.subscriptions.events` with event_type='updated' and entity_subtype='plan'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTIONS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSubscriptionPlanDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.subscriptionPlanId as string | undefined) ||
        (entity as { subscriptionPlanId?: string }).subscriptionPlanId ||
        '';
      return {
        event_type: EVENT_TYPES.UPDATED,
        entity_id: entityId,
        entity_subtype: 'plan',
        data: entity,
      };
    },
  })
  async update(
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.updateSubscriptionPlanUseCase.execute(dto);
  }

  /**
   * Emits `mesa-ya.subscriptions.events` with event_type='deleted' and entity_subtype='plan'.
   */
  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTIONS,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteSubscriptionPlanDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { subscriptionPlanId?: string }).subscriptionPlanId ||
        command?.subscriptionPlanId ||
        '';
      return {
        event_type: EVENT_TYPES.DELETED,
        entity_id: entityId,
        entity_subtype: 'plan',
        data: deletion,
      };
    },
  })
  async delete(
    dto: DeleteSubscriptionPlanDto,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    return this.deleteSubscriptionPlanUseCase.execute(dto);
  }
}
