import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserOrmEntity } from '../../../../auth/entities/user.entity.js';
import {
  Reservation,
  ReservationNotFoundError,
  ReservationRestaurantNotFoundError,
  ReservationUserNotFoundError,
} from '../../domain/index.js';
import {
  ListReservationsQuery,
  ListRestaurantReservationsQuery,
} from '../../application/dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { paginateQueryBuilder } from '../../../../shared/infrastructure/pagination/paginate.js';
import { type ReservationRepositoryPort } from '../../application/ports/index.js';
import { ReservationOrmEntity } from '../orm/index.js';
import { ReservationOrmMapper } from '../mappers/index.js';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';

@Injectable()
export class ReservationTypeOrmRepository implements ReservationRepositoryPort {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly bookings: Repository<ReservationOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {}

  async save(booking: Reservation): Promise<Reservation> {
    const snapshot = booking.snapshot();

    const existing = await this.bookings.findOne({
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

    const entity = ReservationOrmMapper.toOrmEntity(booking, {
      existing: existing ?? undefined,
      restaurant,
      user,
    });

    const saved = await this.bookings.save(entity);
    return ReservationOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Reservation | null> {
    const entity = await this.bookings.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    return entity ? ReservationOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.bookings.delete({ id });
    if (!result.affected) {
      throw new ReservationNotFoundError(id);
    }
  }

  async paginate(
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<Reservation>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantReservationsQuery,
  ): Promise<PaginatedResult<Reservation>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<ReservationOrmEntity> {
    const alias = 'booking';
    return this.bookings
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<ReservationOrmEntity>,
    query: ListReservationsQuery,
  ): Promise<PaginatedResult<Reservation>> {
    const alias = qb.alias;

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
