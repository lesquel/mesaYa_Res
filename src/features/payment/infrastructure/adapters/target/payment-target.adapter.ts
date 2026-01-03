/**
 * Payment Target Adapter
 *
 * Infrastructure implementation of IPaymentTargetPort.
 * Provides access to reservation, subscription, and restaurant ownership data
 * through TypeORM repositories.
 *
 * This adapter encapsulates all external module data access,
 * keeping the Payment module decoupled from other modules' internals.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationOrmEntity } from '@features/reservation';
import { SubscriptionOrmEntity } from '@features/subscription';
import { RestaurantOrmEntity } from '@features/restaurants';
import {
  IPaymentTargetPort,
  ReservationOwnership,
  SubscriptionOwnership,
} from '@features/payment/domain';

@Injectable()
export class PaymentTargetAdapter extends IPaymentTargetPort {
  constructor(
    @InjectRepository(ReservationOrmEntity)
    private readonly reservations: Repository<ReservationOrmEntity>,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptions: Repository<SubscriptionOrmEntity>,
    @InjectRepository(RestaurantOrmEntity)
    private readonly restaurants: Repository<RestaurantOrmEntity>,
  ) {
    super();
  }

  async getReservationOwnership(
    reservationId: string,
  ): Promise<ReservationOwnership | null> {
    const reservation = await this.reservations.findOne({
      where: { id: reservationId },
      relations: ['restaurant'],
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

  async getSubscriptionOwnership(
    subscriptionId: string,
  ): Promise<SubscriptionOwnership | null> {
    const subscription = await this.subscriptions.findOne({
      where: { id: subscriptionId },
      relations: ['restaurant'],
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

  async isRestaurantOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<boolean> {
    const count = await this.restaurants.count({
      where: { id: restaurantId, ownerId },
    });
    return count > 0;
  }
}
