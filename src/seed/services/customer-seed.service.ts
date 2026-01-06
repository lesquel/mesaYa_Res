import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ReservationRepositoryPort } from '@features/reservation/application/ports/reservation-repository.port';
import { RESERVATION_REPOSITORY } from '@features/reservation/application/ports/reservation-repository.port';
import type { ReviewRepositoryPort } from '@features/reviews/application/ports/review-repository.port';
import { REVIEW_REPOSITORY } from '@features/reviews/application/ports/review-repository.port';
import { AuthProxyService } from '@features/auth/infrastructure/messaging/auth-proxy.service';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import { Review } from '@features/reviews/domain/entities/review.entity';
import { reservationsSeed, reviewsSeed } from '../data';
import { randomUUID } from 'node:crypto';
import { RestaurantSeedService } from './restaurant-seed.service';

/**
 * Customer Seed Service.
 *
 * Seeds reservations and reviews using user IDs from Auth MS.
 * Uses AuthProxyService to look up users by email.
 */
@Injectable()
export class CustomerSeedService {
  private readonly logger = new Logger(CustomerSeedService.name);
  private reservationIds: string[] = [];
  private reviewIds: string[] = [];

  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
    private readonly authProxy: AuthProxyService,
    private readonly restaurantSeedService: RestaurantSeedService,
  ) {}

  async seedReservations(): Promise<void> {
    this.logger.log('📅 Seeding reservations...');

    if (this.reservationIds.length > 0) {
      this.logger.log(
        '⏭️  Reservations already exist in this session, skipping...',
      );
      return;
    }

    const allRestaurantIds = this.restaurantSeedService.getRestaurantIds();
    if (allRestaurantIds.length === 0) {
      this.logger.warn('⚠️  No restaurants found, cannot seed reservations');
      return;
    }

    for (const reservationSeed of reservationsSeed) {
      // Get user from Auth MS
      const userResponse = await this.authProxy.findUserByEmail(
        reservationSeed.userEmail,
      );

      if (!userResponse.success || !userResponse.data) {
        this.logger.warn(
          `Skipping reservation: user ${reservationSeed.userEmail} not found in Auth MS`,
        );
        continue;
      }

      const userId = userResponse.data.id;

      const restaurantId = this.restaurantSeedService.getRestaurantId(
        reservationSeed.restaurantIndex,
      );
      const tableId = this.restaurantSeedService.getTableId(
        reservationSeed.tableIndex,
      );

      if (!restaurantId || !tableId) {
        this.logger.warn(
          'Skipping reservation: restaurant or table not found in tracked IDs',
        );
        continue;
      }

      const reservationDateTime = new Date(reservationSeed.reservationDate);
      const [hours, minutes] = reservationSeed.reservationTime.split(':');
      reservationDateTime.setHours(Number.parseInt(hours, 10));
      reservationDateTime.setMinutes(Number.parseInt(minutes, 10));

      const reservationId = randomUUID();
      const reservation = ReservationEntity.create(reservationId, {
        userId,
        restaurantId,
        tableId,
        reservationTime: reservationDateTime,
        reservationDate: reservationSeed.reservationDate,
        numberOfGuests: reservationSeed.numberOfGuests,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: reservationSeed.status,
      });

      const savedReservation =
        await this.reservationRepository.save(reservation);
      this.reservationIds.push(savedReservation.id);
    }

    this.logger.log(`✅ Created ${reservationsSeed.length} reservations`);
  }

  async seedReviews(): Promise<void> {
    this.logger.log('⭐ Seeding reviews...');

    if (this.reviewIds.length > 0) {
      this.logger.log('⏭️  Reviews already exist in this session, skipping...');
      return;
    }

    const allRestaurantIds = this.restaurantSeedService.getRestaurantIds();
    if (allRestaurantIds.length === 0) {
      this.logger.warn('⚠️  No restaurants found, cannot seed reviews');
      return;
    }

    for (const reviewSeed of reviewsSeed) {
      // Get user from Auth MS
      const userResponse = await this.authProxy.findUserByEmail(
        reviewSeed.userEmail,
      );

      if (!userResponse.success || !userResponse.data) {
        this.logger.warn(
          `Skipping review: user ${reviewSeed.userEmail} not found in Auth MS`,
        );
        continue;
      }

      const userId = userResponse.data.id;

      const restaurantId = this.restaurantSeedService.getRestaurantId(
        reviewSeed.restaurantIndex,
      );

      if (!restaurantId) {
        this.logger.warn(
          'Skipping review: restaurant not found in tracked IDs',
        );
        continue;
      }

      const reviewId = randomUUID();
      const review = Review.create(
        {
          userId,
          restaurantId,
          rating: reviewSeed.rating,
          comment: reviewSeed.comment,
          createdAt: reviewSeed.createdAt,
        },
        reviewId,
      );

      const savedReview = await this.reviewRepository.save(review);
      this.reviewIds.push(savedReview.id);
    }

    this.logger.log(`✅ Created ${reviewsSeed.length} reviews`);
  }

  getReservationId(index: number): string | undefined {
    return this.reservationIds[index];
  }

  getReviewId(index: number): string | undefined {
    return this.reviewIds[index];
  }
}
