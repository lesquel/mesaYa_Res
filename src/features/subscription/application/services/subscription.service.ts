import type { ILoggerPort } from '@shared/application/ports/logger.port';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  CreateSubscriptionUseCase,
  DeleteSubscriptionUseCase,
  GetSubscriptionByIdUseCase,
  ListSubscriptionsUseCase,
  UpdateSubscriptionStateUseCase,
  UpdateSubscriptionUseCase,
} from '../use-cases';
import {
  CreateSubscriptionDto,
  DeleteSubscriptionDto,
  GetSubscriptionByIdDto,
  UpdateSubscriptionDto,
  UpdateSubscriptionStateDto,
} from '../dtos/input';
import {
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
      this.subscriptionDomainService,
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

  async create(dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.createSubscriptionUseCase.execute(dto);
  }

  async findById(
    dto: GetSubscriptionByIdDto,
  ): Promise<SubscriptionResponseDto> {
    return this.getSubscriptionByIdUseCase.execute(dto);
  }

  async findAll(
    params?: PaginatedQueryParams,
  ): Promise<SubscriptionListResponseDto> {
    return this.listSubscriptionsUseCase.execute(params);
  }

  async update(dto: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.updateSubscriptionUseCase.execute(dto);
  }

  async updateState(
    dto: UpdateSubscriptionStateDto,
  ): Promise<SubscriptionResponseDto> {
    return this.updateSubscriptionStateUseCase.execute(dto);
  }

  async delete(
    dto: DeleteSubscriptionDto,
  ): Promise<DeleteSubscriptionResponseDto> {
    return this.deleteSubscriptionUseCase.execute(dto);
  }
}
