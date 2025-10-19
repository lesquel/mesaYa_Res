import { Inject, Injectable } from '@nestjs/common';
import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  CreateSubscriptionPlanUseCase,
  DeleteSubscriptionPlanUseCase,
  GetSubscriptionPlanByIdUseCase,
  ListSubscriptionPlansUseCase,
  UpdateSubscriptionPlanUseCase,
} from '../use-cases';
import {
  CreateSubscriptionPlanDto,
  DeleteSubscriptionPlanDto,
  GetSubscriptionPlanByIdDto,
  UpdateSubscriptionPlanDto,
} from '../dtos/input';
import {
  DeleteSubscriptionPlanResponseDto,
  SubscriptionPlanListResponseDto,
  SubscriptionPlanResponseDto,
} from '../dtos/output';
import {
  ISubscriptionPlanRepositoryPort,
  SubscriptionPlanDomainService,
} from '@features/subscription/domain';
import { SubscriptionPlanMapper } from '../mappers';
import { LOGGER } from '@shared/infrastructure/adapters/logger/logger.constants';

@Injectable()
export class SubscriptionPlanService {
  private readonly subscriptionPlanDomainService: SubscriptionPlanDomainService;

  private readonly createSubscriptionPlanUseCase: CreateSubscriptionPlanUseCase;
  private readonly getSubscriptionPlanByIdUseCase: GetSubscriptionPlanByIdUseCase;
  private readonly listSubscriptionPlansUseCase: ListSubscriptionPlansUseCase;
  private readonly updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase;
  private readonly deleteSubscriptionPlanUseCase: DeleteSubscriptionPlanUseCase;

  constructor(
    @Inject(LOGGER) logger: ILoggerPort,
    @Inject(ISubscriptionPlanRepositoryPort)
    subscriptionPlanRepository: ISubscriptionPlanRepositoryPort,
    subscriptionPlanMapper: SubscriptionPlanMapper,
  ) {
    this.subscriptionPlanDomainService = new SubscriptionPlanDomainService(
      subscriptionPlanRepository,
    );

    this.createSubscriptionPlanUseCase = new CreateSubscriptionPlanUseCase(
      logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.getSubscriptionPlanByIdUseCase = new GetSubscriptionPlanByIdUseCase(
      logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.listSubscriptionPlansUseCase = new ListSubscriptionPlansUseCase(
      logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.updateSubscriptionPlanUseCase = new UpdateSubscriptionPlanUseCase(
      logger,
      this.subscriptionPlanDomainService,
      subscriptionPlanMapper,
    );

    this.deleteSubscriptionPlanUseCase = new DeleteSubscriptionPlanUseCase(
      logger,
      this.subscriptionPlanDomainService,
    );
  }

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

  async update(
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlanResponseDto> {
    return this.updateSubscriptionPlanUseCase.execute(dto);
  }

  async delete(
    dto: DeleteSubscriptionPlanDto,
  ): Promise<DeleteSubscriptionPlanResponseDto> {
    return this.deleteSubscriptionPlanUseCase.execute(dto);
  }
}
