import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { OwnerUpgradeRequestEntity } from '../../../../domain/owner-upgrade-request.entity';
import { OwnerUpgradeRequestRepositoryPort } from '../../../../application/ports/owner-upgrade-request.repository.port';
import { OwnerUpgradeRequestOrmEntity } from '../orm/owner-upgrade-request.orm-entity';
import { OwnerUpgradeRequestStatus } from '../../../../domain/owner-upgrade-request-status.enum';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination';
import type { PaginatedResult } from '@shared/application/types';
import type { ListOwnerUpgradeRequestsQuery } from '../../../../application/dto';

@Injectable()
export class OwnerUpgradeRequestRepository
  implements OwnerUpgradeRequestRepositoryPort
{
  constructor(
    @InjectRepository(OwnerUpgradeRequestOrmEntity)
    private readonly repository: Repository<OwnerUpgradeRequestOrmEntity>,
  ) {}

  async create(
    request: OwnerUpgradeRequestEntity,
  ): Promise<OwnerUpgradeRequestEntity> {
    const entity = this.toOrmEntity(request);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(
    request: OwnerUpgradeRequestEntity,
  ): Promise<OwnerUpgradeRequestEntity> {
    const entity = this.toOrmEntity(request);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findPendingByUserId(
    userId: string,
    status: OwnerUpgradeRequestStatus = OwnerUpgradeRequestStatus.PENDING,
  ): Promise<OwnerUpgradeRequestEntity | null> {
    const entity = await this.repository.findOne({
      where: { userId, status },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async findById(id: string): Promise<OwnerUpgradeRequestEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async paginate(
    query: ListOwnerUpgradeRequestsQuery,
  ): Promise<PaginatedResult<OwnerUpgradeRequestEntity>> {
    const qb = this.buildBaseQuery();

    if (query.status) {
      qb.andWhere('upgrade.status = :status', { status: query.status });
    }

    if (query.userId) {
      qb.andWhere('upgrade.userId = :userId', { userId: query.userId });
    }

    const sortMap: Record<string, string> = {
      createdAt: 'upgrade.createdAt',
      updatedAt: 'upgrade.updatedAt',
      status: 'upgrade.status',
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const pagination = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [
        'upgrade.restaurantName',
        'upgrade.restaurantLocation',
        'upgrade.restaurantDescription',
        'upgrade.userNote',
        'upgrade.adminNote',
      ],
    });

    return {
      ...pagination,
      results: pagination.results.map((entity) => this.toDomain(entity)),
    };
  }

  private buildBaseQuery(): SelectQueryBuilder<OwnerUpgradeRequestOrmEntity> {
    return this.repository.createQueryBuilder('upgrade');
  }

  private toOrmEntity(
    entity: OwnerUpgradeRequestEntity,
  ): OwnerUpgradeRequestOrmEntity {
    const snapshot = entity.snapshot();
    const orm = new OwnerUpgradeRequestOrmEntity();

    orm.id = snapshot.id!;
    orm.userId = snapshot.userId;
    orm.restaurantName = snapshot.restaurantName;
    orm.restaurantLocation = snapshot.restaurantLocation;
    orm.restaurantDescription = snapshot.restaurantDescription ?? null;
    orm.preferredSubscriptionPlanId =
      snapshot.preferredSubscriptionPlanId ?? null;
    orm.status = snapshot.status ?? OwnerUpgradeRequestStatus.PENDING;
    orm.userNote = snapshot.userNote ?? null;
    orm.adminNote = snapshot.adminNote ?? null;
    orm.assignedRestaurantId = snapshot.assignedRestaurantId ?? null;
    orm.processedBy = snapshot.processedBy ?? null;
    orm.processedAt = snapshot.processedAt ?? null;
    orm.createdAt = snapshot.createdAt;
    orm.updatedAt = snapshot.updatedAt;

    return orm;
  }

  private toDomain(entity: OwnerUpgradeRequestOrmEntity) {
    return OwnerUpgradeRequestEntity.rehydrate({
      id: entity.id,
      userId: entity.userId,
      restaurantName: entity.restaurantName,
      restaurantLocation: entity.restaurantLocation,
      restaurantDescription: entity.restaurantDescription ?? null,
      preferredSubscriptionPlanId: entity.preferredSubscriptionPlanId ?? null,
      status: entity.status,
      userNote: entity.userNote ?? null,
      adminNote: entity.adminNote ?? null,
      assignedRestaurantId: entity.assignedRestaurantId ?? null,
      processedBy: entity.processedBy ?? null,
      processedAt: entity.processedAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
