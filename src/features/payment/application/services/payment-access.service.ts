import { Injectable, Inject } from '@nestjs/common';
import {
  PaymentForbiddenError,
  PaymentTargetNotFoundError,
  IPaymentTargetPort,
  ReservationOwnership,
  SubscriptionOwnership,
} from '@features/payment/domain';
import { PAYMENT_TARGET_PORT } from '@features/payment/payment.tokens';
import type { CreatePaymentDto, PaymentResponseDto } from '../dtos';

@Injectable()
export class PaymentAccessService {
  constructor(
    @Inject(PAYMENT_TARGET_PORT)
    private readonly targetPort: IPaymentTargetPort,
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

    const reservation = await this.targetPort.getReservationOwnership(
      dto.reservationId,
    );

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

    const subscription = await this.targetPort.getSubscriptionOwnership(
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

    const reservation = await this.targetPort.getReservationOwnership(
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
      const subscription = await this.targetPort.getSubscriptionOwnership(
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
      const reservation = await this.targetPort.getReservationOwnership(
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
    const isOwner = await this.targetPort.isRestaurantOwner(
      restaurantId,
      ownerId,
    );

    if (!isOwner) {
      throw new PaymentForbiddenError(
        'Restaurant does not belong to authenticated owner',
      );
    }
  }
}
