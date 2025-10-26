import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { AuthUserOrmMapper } from '../mappers/auth-user.orm-mapper';
import { AuthUser } from '../../../../domain/entities/auth-user.entity';
import { type AuthUserRepositoryPort } from '../../../../application/ports/user.repository.port';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import type { ListUsersQuery } from '../../../../application/dto/input/list-users.query';
import { SelectQueryBuilder } from 'typeorm';
import { ReservationOrmEntity } from '@features/reservation/infrastructure/orm/reservation.orm-entity';

@Injectable()
export class AuthUserTypeOrmRepository implements AuthUserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? AuthUserOrmMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AuthUserOrmMapper.toDomain(entity) : null;
  }

  async save(user: AuthUser): Promise<AuthUser> {
    const entity = AuthUserOrmMapper.toOrm(user);
    const saved = await this.repository.save(entity);
    const persisted = await this.repository.findOne({
      where: { id: saved.id },
    });
    if (!persisted) {
      throw new Error('Failed to reload saved user');
    }
    return AuthUserOrmMapper.toDomain(persisted);
  }

  async paginate(query: ListUsersQuery) {
    const alias = 'user';
    const qb = this.repository.createQueryBuilder(alias).leftJoinAndSelect(`${alias}.roles`, 'role');

    // Optional filters
    if (query.role) {
      qb.andWhere('role.name = :roleName', { roleName: query.role });
    }

    if (typeof query.active === 'boolean') {
      qb.andWhere('user.active = :active', { active: query.active });
    }

    if (query.restaurantId) {
      qb.innerJoin(ReservationOrmEntity, 'reservationFilter', 'reservationFilter.userId = user.id AND reservationFilter.restaurantId = :restaurantId', { restaurantId: query.restaurantId });
    }

    const sortMap: Record<string, string> = {
      email: `${alias}.email`,
      name: `${alias}.name`,
      createdAt: `${alias}.createdAt`,
    };

    const sortByColumn = query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb as SelectQueryBuilder<UserOrmEntity>, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [`${alias}.email`, `${alias}.name`],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((e) => AuthUserOrmMapper.toDomain(e)),
    };
  }
}
