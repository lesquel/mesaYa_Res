import { Inject, Injectable } from '@nestjs/common';
import { KafkaEmit, KAFKA_TOPICS } from '@shared/infrastructure/kafka';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { AuthService } from '@features/auth/application/services/auth.service';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/auth.tokens';
import { UpdateUserRolesCommand } from '@features/auth/application/dto/commands/update-user-roles.command';
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
} from '../../domain/errors';
import type { AuthUser } from '@features/auth/domain/entities/auth-user.entity';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import type { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { UserNotFoundError } from '@features/auth/domain/errors/user-not-found.error';
import { OWNER_UPGRADE_REQUEST_REPOSITORY } from '../../owner-upgrade.tokens';

@Injectable()
export class OwnerUpgradeService {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepositoryPort,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    private readonly upgradeRepository: OwnerUpgradeRequestRepositoryPort,
  ) {}

  async apply(
    dto: OwnerUpgradeRequestDto,
    userId: string,
  ): Promise<OwnerUpgradeResponseDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

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
    topic: KAFKA_TOPICS.OWNER_UPGRADE_STATUS_CHANGED,
    payload: ({ result, args }) => {
      const [, decision] = args as [string, OwnerUpgradeDecisionDto, string];
      const entity = result as OwnerUpgradeResponseDto;
      return {
        action: `owner.upgrade.${entity.status.toLowerCase()}`,
        entityId: entity.requestId,
        userId: args[0],
        status: entity.status,
        assignedRestaurantId: entity.assignedRestaurantId,
        decision: decision.status,
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

      await this.grantOwnerRole(targetUserId);

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

  private async grantOwnerRole(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const roleNames = new Set(user.roles.map((role) => role.name));
    roleNames.add(AuthRoleName.OWNER);

    const command = new UpdateUserRolesCommand(userId, Array.from(roleNames));

    await this.authService.updateUserRoles(command);
  }

  private userAlreadyOwner(user: AuthUser): boolean {
    return user.roles.some((role) => role.name === AuthRoleName.OWNER);
  }
}
