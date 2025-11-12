import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserOrmEntity } from '@features/auth/infrastructure/database/typeorm/entities/user.orm-entity';
import {
  ReservationEntity,
  ReservationNotFoundError,
  ReservationRestaurantNotFoundError,
  ReservationUserNotFoundError,
} from '../../domain';
import {
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
} from '../../application/dto';
import { PaginatedResult } from '@shared/application/types/pagination';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination/paginate';
import { type ReservationRepositoryPort } from '../../application/ports';
import { IReservationRepositoryPort } from '../../domain/repositories';
import type { ReservationWindowQuery } from '../../domain/types';
import { ReservationOrmEntity } from '../orm';
import { ReservationOrmMapper } from '../mappers';
import { RestaurantOrmEntity } from '../../../restaurants';

@Injectable()
export class ReservationTypeOrmRepository
  implements ReservationRepositoryPort, IReservationRepositoryPort
{
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {}

  async save(reservation: ReservationEntity): Promise<ReservationEntity> {
    const snapshot = reservation.snapshot();

    const existing = await this.reservations.findOne({
      where: { id: snapshot.id },
      relations: ['restaurant', 'user'],
    });

    let restaurant = existing?.restaurant;
    let user = existing?.user;

    if (!existing) {
      const [foundRestaurant, foundUser] = await Promise.all([
        this.restaurants.findOne({ where: { id: snapshot.restaurantId } }),
        this.users.findOne({ where: { id: snapshot.userId } }),
      ]);

      restaurant = foundRestaurant ?? undefined;
      user = foundUser ?? undefined;

      if (!restaurant) {
        throw new ReservationRestaurantNotFoundError(snapshot.restaurantId);
      }

      if (!user) {
        throw new ReservationUserNotFoundError(snapshot.userId);
      }
    }

    const entity = ReservationOrmMapper.toOrmEntity(reservation, {
      existing: existing ?? undefined,
      restaurant,
      user,
    });

    const saved = await this.reservations.save(entity);
    return ReservationOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const entity = await this.reservations.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    return entity ? ReservationOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.reservations.delete({ id });
    if (!result.affected) {
      throw new ReservationNotFoundError(id);
    }
  }

  async findActiveWithinWindow(
    query: ReservationWindowQuery,
  ): Promise<ReservationEntity[]> {
    const qb = this.reservations
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.restaurant', 'restaurant')
      .where('reservation.reservationTime BETWEEN :startAt AND :endAt', {
        startAt: query.startAt,
        endAt: query.endAt,
      })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: ['PENDING', 'CONFIRMED'],
      });

    if (query.tableId) {
      qb.andWhere('reservation.tableId = :tableId', { tableId: query.tableId });
    }

    if (query.userId) {
      qb.andWhere('reservation.userId = :userId', { userId: query.userId });
    }

    if (query.excludeReservationId) {
      qb.andWhere('reservation.id <> :excludeReservationId', {
        excludeReservationId: query.excludeReservationId,
      });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => ReservationOrmMapper.toDomain(entity));
  }

  async paginate(
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ReservationOrmEntity> {
    const alias = 'reservation';
    return this.reservations
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<ReservationOrmEntity>,
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>> {
    const alias = qb.alias;
    // Apply optional filters (status, restaurantId, date)
    if ((query as any).status) {
      qb.andWhere(`${alias}.status = :status`, { status: (query as any).status });
    }

    if ((query as any).restaurantId) {
      qb.andWhere('restaurant.id = :restaurantId', {
        restaurantId: (query as any).restaurantId,
      });
    }

    if ((query as any).date) {
      // filter reservations whose reservationDate falls within the given date
      try {
        const date = new Date((query as any).date);
        if (!isNaN(date.getTime())) {
          const start = new Date(date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          qb.andWhere(`${alias}.reservationDate BETWEEN :startDate AND :endDate`, {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          });
        }
      } catch (e) {
        // ignore invalid dates and let query return unfiltered results
      }
    }

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.createdAt`,
      reservationDate: `${alias}.reservationDate`,
      restaurant: `restaurant.name`,
      user: `user.name`,
    };

    const sortByColumn =
      query.sortBy && sortMap[query.sortBy] ? sortMap[query.sortBy] : undefined;

    const paginationResult = await paginateQueryBuilder(qb, {
      ...query.pagination,
      route: query.route,
      sortBy: sortByColumn,
      sortOrder: query.sortOrder,
      q: query.search,
      allowedSorts: Object.values(sortMap),
      searchable: [
        `${alias}.status`,
        `restaurant.name`,
        `user.name`,
        `user.email`,
      ],
    });

    return {
      ...paginationResult,
      results: paginationResult.results.map((entity) =>
        ReservationOrmMapper.toDomain(entity),
      ),
    };
  }
}
