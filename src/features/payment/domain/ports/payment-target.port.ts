/**
 * Payment Target Port
 *
 * Abstract interface for accessing reservation and subscription ownership data.
 * This port decouples the Payment module from direct TypeORM dependencies
 * on other modules (Reservation, Subscription, Restaurant).
 *
 * Following the Ports & Adapters pattern, the infrastructure layer
 * will provide a concrete implementation (PaymentTargetAdapter).
 */

export interface ReservationOwnership {
  readonly reservationId: string;
  readonly userId: string;
  readonly restaurantId: string;
  readonly restaurantOwnerId: string | null;
}

export interface SubscriptionOwnership {
  readonly subscriptionId: string;
  readonly restaurantId: string;
  readonly restaurantOwnerId: string | null;
}

export abstract class IPaymentTargetPort {
  /**
   * Get ownership information for a reservation.
   * Used to validate that a user can create a payment for a reservation.
   *
   * @param reservationId - The reservation UUID
   * @returns Ownership data or null if not found
   */
  abstract getReservationOwnership(
    reservationId: string,
  ): Promise<ReservationOwnership | null>;

  /**
   * Get ownership information for a subscription.
   * Used to validate that an owner can create a payment for a subscription.
   *
   * @param subscriptionId - The subscription UUID
   * @returns Ownership data or null if not found
   */
  abstract getSubscriptionOwnership(
    subscriptionId: string,
  ): Promise<SubscriptionOwnership | null>;

  /**
   * Check if a user is the owner of a restaurant.
   * Used for authorization checks on restaurant-level payment operations.
   *
   * @param restaurantId - The restaurant UUID
   * @param ownerId - The user UUID to check
   * @returns true if the user owns the restaurant
   */
  abstract isRestaurantOwner(
    restaurantId: string,
    ownerId: string,
  ): Promise<boolean>;
}
