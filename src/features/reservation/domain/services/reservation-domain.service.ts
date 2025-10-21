import {
  InvalidReservationDataError,
  ReservationCapacityExceededError,
  ReservationMaxAdvanceWindowError,
  ReservationNotFoundError,
  ReservationOutsideOperatingHoursError,
  ReservationOwnershipError,
  ReservationRestaurantNotFoundError,
  ReservationSlotUnavailableError,
  ReservationTableMismatchError,
  ReservationTableNotFoundError,
  ReservationUserInactiveError,
  ReservationUserNotFoundError,
  ReservationUserTimeConflictError,
} from '../errors';
import { ReservationEntity } from '../entities/reservation.entity';
import {
  ReservationCancellationRequest,
  ReservationScheduleRequest,
  ReservationUpdateRequest,
} from '../types';
import { IReservationRepositoryPort } from '../repositories';
import {
  IReservationRestaurantPort,
  IReservationTablePort,
  IReservationUserPort,
  ReservationRestaurantSnapshot,
  ReservationTableSnapshot,
  ReservationUserSnapshot,
} from '../ports';
import {
  RESERVATION_MAX_FUTURE_MONTHS,
  RESERVATION_SLOT_DURATION_MINUTES,
} from '../constants/reservation.constants';
import type { RestaurantDay } from '@features/restaurants/domain/entities/values/restaurant-day';

const ACTIVE_RESERVATION_STATUSES: Array<ReservationEntity['status']> = [
  'PENDING',
  'CONFIRMED',
];

function addMinutes(source: Date, minutes: number): Date {
  const result = new Date(source);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

function getRestaurantDay(date: Date): RestaurantDay {
  const days: Record<number, RestaurantDay> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  return days[date.getDay()];
}

function minutesBetween(openTime: string, closeTime: string): number {
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  return (closeHour - openHour) * 60 + (closeMinute - openMinute);
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export class ReservationDomainService {
  constructor(
    private readonly reservationRepository: IReservationRepositoryPort,
    private readonly restaurantPort: IReservationRestaurantPort,
    private readonly tablePort: IReservationTablePort,
    private readonly userPort: IReservationUserPort,
  ) {}

  async scheduleReservation(
    request: ReservationScheduleRequest,
  ): Promise<ReservationEntity> {
    const slotDurationMinutes =
      request.durationMinutes ?? RESERVATION_SLOT_DURATION_MINUTES;

    const restaurant = await this.ensureRestaurant(request.restaurantId);
    const user = await this.ensureUser(request.userId);
    const table = await this.ensureTable(request.tableId);

    this.ensureTableMatchesRestaurant(table, restaurant);
    this.ensureCapacity(table, request.numberOfGuests);

    const startAt = combineDateAndTime(
      request.reservationDate,
      request.reservationTime,
    );
    const endAt = addMinutes(startAt, slotDurationMinutes);

    this.ensureFutureSlot(startAt);
    this.ensureWithinAdvanceWindow(startAt);
    this.ensureRestaurantDay(restaurant, startAt);
    this.ensureOperatingHours(restaurant, startAt, endAt);

    await this.ensureTableAvailability(
      table,
      startAt,
      endAt,
      request.reservationId,
    );
    await this.ensureUserAvailability(
      user,
      startAt,
      endAt,
      request.reservationId,
    );

    const reservation = ReservationEntity.create(request.reservationId, {
      userId: request.userId,
      restaurantId: request.restaurantId,
      tableId: request.tableId,
      reservationDate: new Date(request.reservationDate),
      reservationTime: startAt,
      numberOfGuests: request.numberOfGuests,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING',
    });

    return this.reservationRepository.save(reservation);
  }

  async updateReservation(
    request: ReservationUpdateRequest,
  ): Promise<ReservationEntity> {
    const reservation = await this.reservationRepository.findById(
      request.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(request.reservationId);
    }

    if (reservation.userId !== request.userId) {
      throw new ReservationOwnershipError();
    }

    const slotDurationMinutes =
      request.durationMinutes ?? RESERVATION_SLOT_DURATION_MINUTES;

    const table = await this.ensureTable(reservation.tableId);
    const restaurant = await this.ensureRestaurant(reservation.restaurantId);
    const user = await this.ensureUser(reservation.userId);

    let nextDate = reservation.reservationDate;
    if (request.reservationDate) {
      nextDate = new Date(request.reservationDate);
    }

    let nextTime = reservation.reservationTime;
    if (request.reservationTime) {
      nextTime = new Date(request.reservationTime);
    }

    const startAt = combineDateAndTime(nextDate, nextTime);
    const endAt = addMinutes(startAt, slotDurationMinutes);

    if (request.reservationDate || request.reservationTime) {
      this.ensureFutureSlot(startAt);
      this.ensureWithinAdvanceWindow(startAt);
      this.ensureRestaurantDay(restaurant, startAt);
      this.ensureOperatingHours(restaurant, startAt, endAt);

      await this.ensureTableAvailability(table, startAt, endAt, reservation.id);

      await this.ensureUserAvailability(user, startAt, endAt, reservation.id);
    }

    const nextNumberOfGuests =
      request.numberOfGuests ?? reservation.numberOfGuests;
    this.ensureCapacity(table, nextNumberOfGuests);

    reservation.update({
      reservationDate: nextDate,
      reservationTime: startAt,
      numberOfGuests: nextNumberOfGuests,
    });

    return this.reservationRepository.save(reservation);
  }

  async cancelReservation(
    request: ReservationCancellationRequest,
  ): Promise<ReservationEntity> {
    const reservation = await this.reservationRepository.findById(
      request.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(request.reservationId);
    }

    if (reservation.userId !== request.userId) {
      throw new ReservationOwnershipError();
    }

    await this.reservationRepository.delete(reservation.id);
    return reservation;
  }

  private async ensureRestaurant(
    restaurantId: string,
  ): Promise<ReservationRestaurantSnapshot> {
    const restaurant = await this.restaurantPort.loadById(restaurantId);

    if (!restaurant) {
      throw new ReservationRestaurantNotFoundError(restaurantId);
    }

    if (!restaurant.active) {
      throw new ReservationOutsideOperatingHoursError(restaurantId);
    }

    return restaurant;
  }

  private async ensureUser(userId: string): Promise<ReservationUserSnapshot> {
    const user = await this.userPort.loadById(userId);

    if (!user) {
      throw new ReservationUserNotFoundError(userId);
    }

    if (!user.active) {
      throw new ReservationUserInactiveError(userId);
    }

    return user;
  }

  private async ensureTable(
    tableId: string,
  ): Promise<ReservationTableSnapshot> {
    const table = await this.tablePort.loadById(tableId);

    if (!table) {
      throw new ReservationTableNotFoundError(tableId);
    }

    return table;
  }

  private ensureTableMatchesRestaurant(
    table: ReservationTableSnapshot,
    restaurant: ReservationRestaurantSnapshot,
  ): void {
    if (table.restaurantId !== restaurant.restaurantId) {
      throw new ReservationTableMismatchError(
        restaurant.restaurantId,
        table.tableId,
      );
    }
  }

  private ensureCapacity(
    table: ReservationTableSnapshot,
    numberOfGuests: number,
  ): void {
    if (numberOfGuests > table.capacity) {
      throw new ReservationCapacityExceededError(table.tableId, table.capacity);
    }
  }

  private ensureFutureSlot(startAt: Date): void {
    const now = new Date();
    if (startAt.getTime() <= now.getTime()) {
      throw new InvalidReservationDataError(
        'Reservation time must be in the future',
      );
    }
  }

  private ensureWithinAdvanceWindow(startAt: Date): void {
    const limit = new Date();
    limit.setMonth(limit.getMonth() + RESERVATION_MAX_FUTURE_MONTHS);
    if (startAt.getTime() > limit.getTime()) {
      throw new ReservationMaxAdvanceWindowError(RESERVATION_MAX_FUTURE_MONTHS);
    }
  }

  private ensureRestaurantDay(
    restaurant: ReservationRestaurantSnapshot,
    startAt: Date,
  ): void {
    const day = getRestaurantDay(startAt);
    if (!restaurant.daysOpen.includes(day)) {
      throw new ReservationOutsideOperatingHoursError(restaurant.restaurantId);
    }
  }

  private ensureOperatingHours(
    restaurant: ReservationRestaurantSnapshot,
    startAt: Date,
    endAt: Date,
  ): void {
    const openMinutes = toMinutes(restaurant.openTime);
    const closeMinutes = toMinutes(restaurant.closeTime);

    if (closeMinutes <= openMinutes) {
      throw new InvalidReservationDataError(
        'Restaurant operating hours are invalid',
      );
    }

    const startMinutes = startAt.getHours() * 60 + startAt.getMinutes();
    const endMinutes = endAt.getHours() * 60 + endAt.getMinutes();

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      throw new ReservationOutsideOperatingHoursError(restaurant.restaurantId);
    }

    const slotDuration = endMinutes - startMinutes;
    if (
      slotDuration > minutesBetween(restaurant.openTime, restaurant.closeTime)
    ) {
      throw new InvalidReservationDataError(
        'Reservation duration exceeds restaurant schedule',
      );
    }
  }

  private async ensureTableAvailability(
    table: ReservationTableSnapshot,
    startAt: Date,
    endAt: Date,
    excludeReservationId?: string,
  ): Promise<void> {
    const margins = this.buildWindow(startAt, endAt);
    const reservations =
      await this.reservationRepository.findActiveWithinWindow({
        tableId: table.tableId,
        startAt: margins.windowStart,
        endAt: margins.windowEnd,
        excludeReservationId,
      });

    if (this.hasOverlap(reservations, startAt, endAt)) {
      throw new ReservationSlotUnavailableError(table.tableId, startAt);
    }
  }

  private async ensureUserAvailability(
    user: ReservationUserSnapshot,
    startAt: Date,
    endAt: Date,
    excludeReservationId?: string,
  ): Promise<void> {
    const margins = this.buildWindow(startAt, endAt);
    const reservations =
      await this.reservationRepository.findActiveWithinWindow({
        userId: user.userId,
        startAt: margins.windowStart,
        endAt: margins.windowEnd,
        excludeReservationId,
      });

    if (this.hasOverlap(reservations, startAt, endAt)) {
      throw new ReservationUserTimeConflictError(user.userId, startAt);
    }
  }

  private buildWindow(
    startAt: Date,
    endAt: Date,
  ): {
    windowStart: Date;
    windowEnd: Date;
  } {
    const paddingMinutes = RESERVATION_SLOT_DURATION_MINUTES;
    const windowStart = addMinutes(startAt, -paddingMinutes);
    const windowEnd = addMinutes(endAt, paddingMinutes);
    return { windowStart, windowEnd };
  }

  private hasOverlap(
    reservations: ReservationEntity[],
    startAt: Date,
    endAt: Date,
  ): boolean {
    return reservations
      .filter((reservation) =>
        ACTIVE_RESERVATION_STATUSES.includes(reservation.status),
      )
      .some((reservation) => {
        const existingStart = reservation.reservationTime;
        const existingEnd = addMinutes(
          existingStart,
          RESERVATION_SLOT_DURATION_MINUTES,
        );
        return existingStart < endAt && existingEnd > startAt;
      });
  }
}
