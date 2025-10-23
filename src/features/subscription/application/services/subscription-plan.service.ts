import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  KafkaEmit,
  KafkaService,
  KAFKA_TOPICS,
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
  private readonly kafkaService: KafkaService;

  constructor(
    private readonly logger: ILoggerPort,
    subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
    subscriptionPlanMapper: SubscriptionPlanMapper,
    kafkaService: KafkaService,
  ) {
    this.subscriptionPlanDomainService = new SubscriptionPlanDomainService(
      subscriptionPlanRepository,
    );
    this.kafkaService = kafkaService;

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
      this.subscriptionPlanDomainService,
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

  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_PLAN_CREATED,
    payload: ({ result, toPlain }) => {
      const entity = toPlain(result ?? {});
      const entityId =
        (entity as { subscriptionPlanId?: string }).subscriptionPlanId ?? null;
      return {
        action: 'subscription-plan.created',
        entityId,
        entity,
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
    params?: PaginatedQueryParams,
  ): Promise<SubscriptionPlanListResponseDto> {
    return this.listSubscriptionPlansUseCase.execute(params);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_PLAN_UPDATED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [UpdateSubscriptionPlanDto];
      const entity = toPlain(result ?? {});
      const entityId =
        (command?.subscriptionPlanId as string | undefined) ||
        (entity as { subscriptionPlanId?: string }).subscriptionPlanId ||
        null;
      return {
        action: 'subscription-plan.updated',
        entityId,
        entity,
      };
    },
  })
  async update(
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.updateSubscriptionPlanUseCase.execute(dto);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.SUBSCRIPTION_PLAN_DELETED,
    payload: ({ result, args, toPlain }) => {
      const [command] = args as [DeleteSubscriptionPlanDto];
      const deletion = toPlain(result ?? {});
      const entityId =
        (deletion as { subscriptionPlanId?: string }).subscriptionPlanId ||
        command?.subscriptionPlanId ||
        null;
      return {
        action: 'subscription-plan.deleted',
        entityId,
        entity: deletion,
      };
    },
  })
  async delete(
    dto: DeleteSubscriptionPlanDto,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    return this.deleteSubscriptionPlanUseCase.execute(dto);
  }
}
