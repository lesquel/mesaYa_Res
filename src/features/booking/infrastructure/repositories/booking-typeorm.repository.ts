import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../../../auth/entities/user.entity.js';
import {
  Booking,
  BookingNotFoundError,
  BookingRestaurantNotFoundError,
  BookingUserNotFoundError,
} from '../../domain/index.js';
import { ListBookingsQuery, ListRestaurantBookingsQuery } from '../../application/dto/index.js';
import { PaginatedResult } from '@shared/application/types/pagination.js';
import { paginateQueryBuilder } from '../../../../shared/infrastructure/pagination/paginate.js';
import { type BookingRepositoryPort } from '../../application/ports/index.js';
import { BookingOrmEntity } from '../orm/index.js';
import { BookingOrmMapper } from '../mappers/index.js';
import { RestaurantOrmEntity } from '../../../restaurants/index.js';

@Injectable()
export class BookingTypeOrmRepository implements BookingRepositoryPort {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly bookings: Repository<BookingOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async save(booking: Booking): Promise<Booking> {
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
        throw new BookingRestaurantNotFoundError(snapshot.restaurantId);
      }

      if (!user) {
        throw new BookingUserNotFoundError(snapshot.userId);
      }
    }

    const entity = BookingOrmMapper.toOrmEntity(booking, {
      existing: existing ?? undefined,
      restaurant,
      user,
    });

    const saved = await this.bookings.save(entity);
    return BookingOrmMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Booking | null> {
    const entity = await this.bookings.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    return entity ? BookingOrmMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const result = await this.bookings.delete({ id });
    if (!result.affected) {
      throw new BookingNotFoundError(id);
    }
  }

  async paginate(query: ListBookingsQuery): Promise<PaginatedResult<Booking>> {
    const qb = this.buildBaseQuery();
    return this.executePagination(qb, query);
  }

  async paginateByRestaurant(
    query: ListRestaurantBookingsQuery,
  ): Promise<PaginatedResult<Booking>> {
    const qb = this.buildBaseQuery().where('restaurant.id = :restaurantId', {
      restaurantId: query.restaurantId,
    });
    return this.executePagination(qb, query);
  }

  private buildBaseQuery(): SelectQueryBuilder<BookingOrmEntity> {
    const alias = 'booking';
    return this.bookings
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.user`, 'user')
      .leftJoinAndSelect(`${alias}.restaurant`, 'restaurant');
  }

  private async executePagination(
    qb: SelectQueryBuilder<BookingOrmEntity>,
    query: ListBookingsQuery,
  ): Promise<PaginatedResult<Booking>> {
    const alias = qb.alias;

    const sortMap: Record<string, string> = {
      createdAt: `${alias}.created_at`,
      reservationDate: `${alias}.reservation_date`,
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
        BookingOrmMapper.toDomain(entity),
      ),
    };
  }
}
