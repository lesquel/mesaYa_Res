import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  KafkaEmit,
  KafkaProducer,
  KafkaService,
  KAFKA_TOPICS,
  EVENT_TYPES,
} from '@shared/infrastructure/kafka';
import {
  AuthRoleName,
  AUTH_PROVIDER,
  type IAuthProvider,
  type ProviderUserInfo,
} from '@features/auth';
import type { OwnerUpgradeRequestRepositoryPort } from '../ports/owner-upgrade-request.repository.port';
import { OwnerUpgradeRequestEntity } from '../../domain/owner-upgrade-request.entity';
import { OwnerUpgradeRequestStatus } from '../../domain/owner-upgrade-request-status.enum';
import type { OwnerUpgradeRequestDto } from '../../interface/dto/owner-upgrade-request.dto';
import type { OwnerUpgradeDecisionDto } from '../../interface/dto/owner-upgrade-decision.dto';
import { OwnerUpgradeResponseDto } from '../../interface/dto/owner-upgrade-response.dto';
import {
  OwnerUpgradeAlreadyExistsError,
  OwnerUpgradeForbiddenError,
  OwnerUpgradeMissingDataError,
  OwnerUpgradeNotFoundError,
  OwnerUpgradeRequestNotFoundError,
} from '../../domain/errors';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import type { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { OWNER_UPGRADE_REQUEST_REPOSITORY } from '../../owner-upgrade.tokens';
import type {
  ListOwnerUpgradeRequestsQuery,
  PaginatedOwnerUpgradeResponse,
} from '../dto';

/**
 * Owner Upgrade Service.
 *
 * Uses IAuthProvider to communicate with Auth MS for user operations.
 * No local user repository - users live in Auth MS only.
 */
@Injectable()
export class OwnerUpgradeService {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly authProvider: IAuthProvider,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    @Inject(OWNER_UPGRADE_REQUEST_REPOSITORY)
    private readonly upgradeRepository: OwnerUpgradeRequestRepositoryPort,
    @KafkaProducer() private readonly kafkaService: KafkaService,
  ) {}

  async listRequests(
    query: ListOwnerUpgradeRequestsQuery,
  ): Promise<PaginatedOwnerUpgradeResponse> {
    const result = await this.upgradeRepository.paginate(query);
    return {
      ...result,
      results: result.results.map((request) =>
        OwnerUpgradeResponseDto.fromEntity(request),
      ),
    };
  }

  async findRequestById(requestId: string): Promise<OwnerUpgradeResponseDto> {
    const entity = await this.upgradeRepository.findById(requestId);
    if (!entity) {
      throw new OwnerUpgradeRequestNotFoundError(requestId);
    }
    return OwnerUpgradeResponseDto.fromEntity(entity);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.OWNER_UPGRADE,
    payload: ({ result, args, toPlain }) => {
      const entity = result as OwnerUpgradeResponseDto;
      return {
        event_type: EVENT_TYPES.CREATED,
        entity_id: entity.requestId,
        data: toPlain(entity),
      };
    },
  })
  async apply(
    dto: OwnerUpgradeRequestDto,
    userId: string,
  ): Promise<OwnerUpgradeResponseDto> {
    const user = await this.getUserFromAuthMs(userId);

    if (this.userAlreadyOwner(user)) {
      throw new OwnerUpgradeForbiddenError('owner.upgrade.errors.alreadyOwner');
    }

    const existing = await this.upgradeRepository.findPendingByUserId(userId);
    if (existing) {
      throw new OwnerUpgradeAlreadyExistsError(userId);
    }

    const request = OwnerUpgradeRequestEntity.create({
      userId,
      restaurantName: dto.restaurantName,
      restaurantLocation: dto.restaurantLocation,
      restaurantDescription: dto.restaurantDescription,
      preferredSubscriptionPlanId: dto.subscriptionPlanId,
      userNote: dto.message,
    });

    const saved = await this.upgradeRepository.create(request);
    return OwnerUpgradeResponseDto.fromEntity(saved);
  }

  @KafkaEmit({
    topic: KAFKA_TOPICS.OWNER_UPGRADE,
    payload: ({ result, args }) => {
      const [, decision] = args as [string, OwnerUpgradeDecisionDto, string];
      const entity = result as OwnerUpgradeResponseDto;
      return {
        event_type: EVENT_TYPES.STATUS_CHANGED,
        entity_id: entity.requestId,
        data: {
          userId: args[0],
          status: entity.status,
          assignedRestaurantId: entity.assignedRestaurantId,
          decision: decision.status,
        },
      };
    },
  })
  async process(
    targetUserId: string,
    decision: OwnerUpgradeDecisionDto,
    adminId: string,
  ): Promise<OwnerUpgradeResponseDto> {
    const request =
      await this.upgradeRepository.findPendingByUserId(targetUserId);
    if (!request) {
      throw new OwnerUpgradeNotFoundError(targetUserId);
    }

    if (decision.status === OwnerUpgradeRequestStatus.APPROVED) {
      if (!decision.restaurantId) {
        throw new OwnerUpgradeMissingDataError('restaurantId');
      }

      await this.restaurantRepository.assignOwner(
        decision.restaurantId,
        targetUserId,
      );

      // TODO: When Auth MS supports role updates via Kafka, emit event here
      // For now, the role update should be done directly in Auth MS admin panel
      // await this.grantOwnerRole(targetUserId);

      request.approve({
        restaurantId: decision.restaurantId,
        adminId,
        adminNote: decision.adminMessage,
      });
    } else if (decision.status === OwnerUpgradeRequestStatus.REJECTED) {
      request.reject({
        adminId,
        adminNote: decision.adminMessage,
      });
    } else {
      throw new OwnerUpgradeForbiddenError(
        'owner.upgrade.errors.invalidStatus',
      );
    }

    const updated = await this.upgradeRepository.update(request);
    return OwnerUpgradeResponseDto.fromEntity(updated);
  }

  /**
   * Get user info from Auth MS.
   */
  private async getUserFromAuthMs(userId: string): Promise<ProviderUserInfo> {
    const user = await this.authProvider.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return user;
  }

  /**
   * Check if user already has OWNER role.
   */
  private userAlreadyOwner(user: ProviderUserInfo): boolean {
    return user.roles.some((role) => role === AuthRoleName.OWNER);
  }
}
