import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationOrmEntity } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';
import {
  PaymentForbiddenError,
  PaymentTargetNotFoundError,
} from '@features/payment/domain';
import type { CreatePaymentDto, PaymentResponseDto } from '../dtos';

interface ReservationOwnershipSnapshot {
  reservationId: string;
  userId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

interface SubscriptionOwnershipSnapshot {
  subscriptionId: string;
  restaurantId: string;
  restaurantOwnerId: string | null;
}

@Injectable()
export class PaymentAccessService {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {}

  async assertUserReservationPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<void> {
    if (!dto.reservationId) {
      throw new PaymentForbiddenError(
        'Users can only register payments for their reservations',
      );
    }

    if (dto.subscriptionId) {
      throw new PaymentForbiddenError(
        'Users cannot target subscriptions when creating payments',
      );
    }

    const reservation = await this.loadReservationOwnership(dto.reservationId);

    if (!reservation) {
      throw new PaymentTargetNotFoundError('reservation', dto.reservationId);
    }

    if (reservation.userId !== userId) {
      throw new PaymentForbiddenError(
        'Reservation does not belong to authenticated user',
      );
    }
  }

  async assertOwnerSubscriptionPayment(
    dto: CreatePaymentDto,
    ownerId: string,
  ): Promise<void> {
    if (!dto.subscriptionId) {
      throw new PaymentForbiddenError(
        'Restaurant owners must provide a subscription identifier',
      );
    }

    if (dto.reservationId) {
      throw new PaymentForbiddenError(
        'Restaurant owners cannot target reservations when creating payments',
      );
    }

    const subscription = await this.loadSubscriptionOwnership(
      dto.subscriptionId,
    );

    if (!subscription) {
      throw new PaymentTargetNotFoundError('subscription', dto.subscriptionId);
    }

    if (subscription.restaurantOwnerId !== ownerId) {
      throw new PaymentForbiddenError(
        'Subscription does not belong to authenticated owner',
      );
    }
  }

  async assertUserPaymentAccess(
    payment: PaymentResponseDto,
    userId: string,
  ): Promise<void> {
    if (!payment.reservationId) {
      throw new PaymentForbiddenError(
        'Users can only access payments linked to their reservations',
      );
    }

    const reservation = await this.loadReservationOwnership(
      payment.reservationId,
    );

    if (!reservation) {
      throw new PaymentTargetNotFoundError(
        'reservation',
        payment.reservationId,
      );
    }

    if (reservation.userId !== userId) {
      throw new PaymentForbiddenError(
        'Reservation payment does not belong to authenticated user',
      );
    }
  }

  async assertOwnerPaymentAccess(
    payment: PaymentResponseDto,
    ownerId: string,
  ): Promise<void> {
    if (payment.subscriptionId) {
      const subscription = await this.loadSubscriptionOwnership(
        payment.subscriptionId,
      );

      if (!subscription) {
        throw new PaymentTargetNotFoundError(
          'subscription',
          payment.subscriptionId,
        );
      }

      if (subscription.restaurantOwnerId !== ownerId) {
        throw new PaymentForbiddenError(
          'Subscription payment does not belong to authenticated owner',
        );
      }

      return;
    }

    if (payment.reservationId) {
      const reservation = await this.loadReservationOwnership(
        payment.reservationId,
      );

      if (!reservation) {
        throw new PaymentTargetNotFoundError(
          'reservation',
          payment.reservationId,
        );
      }

      if (reservation.restaurantOwnerId !== ownerId) {
        throw new PaymentForbiddenError(
          'Reservation payment does not belong to authenticated owner',
        );
      }

      return;
    }

    throw new PaymentForbiddenError('Payment is not associated to a target');
  }

  async assertRestaurantOwnership(
    restaurantId: string,
    ownerId: string,
  ): Promise<void> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
      select: { id: true, ownerId: true },
    });

    if (!restaurant) {
      throw new PaymentTargetNotFoundError('restaurant', restaurantId);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new PaymentForbiddenError(
        'Restaurant does not belong to authenticated owner',
      );
    }
  }

  private async loadReservationOwnership(
    reservationId: string,
  ): Promise<ReservationOwnershipSnapshot | null> {
    if (!reservationId) {
      return null;
    }

    const reservation = await this.reservations.findOne({
      where: { id: reservationId },
      relations: { restaurant: true },
    });

    if (!reservation) {
      return null;
    }

    return {
      reservationId: reservation.id,
      userId: reservation.userId,
      restaurantId: reservation.restaurantId,
      restaurantOwnerId: reservation.restaurant?.ownerId ?? null,
    };
  }

  private async loadSubscriptionOwnership(
    subscriptionId: string,
  ): Promise<SubscriptionOwnershipSnapshot | null> {
    if (!subscriptionId) {
      return null;
    }

    const subscription = await this.subscriptions.findOne({
      where: { id: subscriptionId },
      relations: { restaurant: true },
    });

    if (!subscription) {
      return null;
    }

    return {
      subscriptionId: subscription.id,
      restaurantId: subscription.restaurantId,
      restaurantOwnerId: subscription.restaurant?.ownerId ?? null,
    };
  }
}
