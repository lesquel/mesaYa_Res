import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ReservationEntity,
  ReservationNotFoundError,
  ReservationRestaurantNotFoundError,
} from '../../domain';
import {
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
  ListOwnerReservationsQuery,
} from '../../application/dto';
import { PaginatedResult } from '@shared/application/types';
import { paginateQueryBuilder } from '@shared/infrastructure/pagination';
import { type ReservationRepositoryPort } from '../../application/ports';
import { IReservationRepositoryPort } from '../../domain/repositories';
import type { ReservationWindowQuery } from '../../domain/types';
import { ReservationOrmEntity } from '../orm/reservation.orm-entity';
import { ReservationOrmMapper } from '../mappers';
import { RestaurantOrmEntity } from '@features/restaurants/infrastructure/database/typeorm/orm/restaurant.orm-entity';

/**
 * Reservation repository implementation.
 *
 * Note: user_id is stored as a UUID reference to Auth MS.
 * We do NOT validate that the user exists - we trust the JWT token.
 * User info (name, email) is NOT available locally - use Auth MS API if needed.
 */
@Injectable()
export class ReservationTypeOrmRepository
  implements ReservationRepositoryPort, IReservationRepositoryPort
{
  private readonly logger = new Logger(ReservationTypeOrmRepository.name);

  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async save(reservation: ReservationEntity): Promise<ReservationEntity> {
    const snapshot = reservation.snapshot();

    const existing = await this.reservations.findOne({
      where: { id: snapshot.id },
      relations: ['restaurant'],
    });

    let restaurant = existing?.restaurant;

    if (!existing) {
      const foundRestaurant = await this.restaurants.findOne({
        where: { id: snapshot.restaurantId },
      });

      restaurant = foundRestaurant ?? undefined;

      if (!restaurant) {
        throw new ReservationRestaurantNotFoundError(snapshot.restaurantId);
      }

      // Note: We trust the userId from the JWT token.
      // We don't validate that the user exists in any local table.
    }

    const entity = ReservationOrmMapper.toOrmEntity(reservation, {
      existing: existing ?? undefined,
      restaurant,
    });

    const saved = await this.reservations.save(entity);
    return ReservationOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const entity = await this.reservations.findOne({
      where: { id },
      relations: ['restaurant'],
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

  async paginateByOwner(
    query: ListOwnerReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>> {
    const qb = this.buildBaseQuery().where('restaurant.ownerId = :ownerId', {
      ownerId: query.ownerId,
    });

    if (query.restaurantId) {
      qb.andWhere('restaurant.id = :restaurantId', {
        restaurantId: query.restaurantId,
      });
    }

    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ReservationOrmEntity> {
    const alias = 'reservation';
    return this.reservations
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<ReservationOrmEntity>,
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<ReservationEntity>> {
    const alias = qb.alias;

    // Apply optional filters (status, restaurantId, date)
    if ((query as any).status) {
      const normalizedStatus = String((query as any).status).toUpperCase();
      qb.andWhere(`${alias}.status = :status`, {
        status: normalizedStatus,
      });
    }

    if ((query as any).restaurantId) {
      qb.andWhere('restaurant.id = :restaurantId', {
        restaurantId: (query as any).restaurantId,
      });
    }

    if ((query as any).date) {
      try {
        const date = new Date((query as any).date);
        if (!isNaN(date.getTime())) {
          const start = new Date(date);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          qb.andWhere(
            `${alias}.reservationDate BETWEEN :startDate AND :endDate`,
            {
              startDate: start.toISOString(),
              endDate: end.toISOString(),
            },
          );
        }
      } catch (e) {
        // ignore invalid dates and let query return unfiltered results
      }
    }

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.createdAt`,
      reservationDate: `${alias}.reservationDate`,
      restaurant: `restaurant.name`,
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
      searchable: [`${alias}.status`, `restaurant.name`],
    });

    const mappedResults = paginationResult.results
      .map((entity) => this.safeToDomain(entity))
      .filter((entity): entity is ReservationEntity => Boolean(entity));

    return {
      ...paginationResult,
      results: mappedResults,
    };
  }

  private safeToDomain(entity: ReservationOrmEntity): ReservationEntity | null {
    try {
      return ReservationOrmMapper.toDomain(entity);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown reservation mapping error';
      this.logger.warn(
        `Skipping reservation ${entity?.id ?? 'unknown'} due to invalid payload: ${message}`,
      );
      return null;
    }
  }
}
