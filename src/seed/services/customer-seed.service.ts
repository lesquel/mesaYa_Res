import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ReservationRepositoryPort } from '@features/reservation/application/ports/reservation-repository.port';
import { RESERVATION_REPOSITORY } from '@features/reservation/application/ports/reservation-repository.port';
import type { ReviewRepositoryPort } from '@features/reviews/application/ports/review-repository.port';
import { REVIEW_REPOSITORY } from '@features/reviews/application/ports/review-repository.port';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/application/ports/user.repository.port';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import { Review } from '@features/reviews/domain/entities/review.entity';
import { reservationsSeed, reviewsSeed } from '../data';
import { randomUUID } from 'node:crypto';
import { RestaurantSeedService } from './restaurant-seed.service';

@Injectable()
export class CustomerSeedService {
  private readonly logger = new Logger(CustomerSeedService.name);

  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepositoryPort,
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: ReviewRepositoryPort,
    @Inject(AUTH_USER_REPOSITORY)
    private readonly userRepository: AuthUserRepositoryPort,
    private readonly restaurantSeedService: RestaurantSeedService,
  ) {}

  async seedReservations(): Promise<void> {
    this.logger.log('📅 Seeding reservations...');

    // Check if reservations exist
    const checkId = 'seed-check-reservation';
    const existing = await this.reservationRepository.findById(checkId);
    if (existing) {
      this.logger.log('⏭️  Reservations already exist, skipping...');
      return;
    }

    for (const reservationSeed of reservationsSeed) {
      const user = await this.userRepository.findByEmail(
        reservationSeed.userEmail,
      );

      if (!user || !user.id) {
        this.logger.warn('Skipping reservation: user not found');
        continue;
      }

      // Get restaurant and table IDs from tracked lists
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

      // Build reservation date/time
      const reservationDateTime = new Date(reservationSeed.reservationDate);
      const [hours, minutes] = reservationSeed.reservationTime.split(':');
      reservationDateTime.setHours(Number.parseInt(hours, 10));
      reservationDateTime.setMinutes(Number.parseInt(minutes, 10));

      // Create reservation entity
      const reservationId = randomUUID();
      const reservation = ReservationEntity.create(reservationId, {
        userId: user.id,
        restaurantId,
        tableId,
        reservationTime: reservationDateTime,
        reservationDate: reservationSeed.reservationDate,
        numberOfGuests: reservationSeed.numberOfGuests,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: reservationSeed.status,
      });

      await this.reservationRepository.save(reservation);
    }

    this.logger.log(`✅ Created ${reservationsSeed.length} reservations`);
  }

  async seedReviews(): Promise<void> {
    this.logger.log('⭐ Seeding reviews...');

    // Check if reviews exist
    const checkId = 'seed-check-review';
    const existing = await this.reviewRepository.findById(checkId);
    if (existing) {
      this.logger.log('⏭️  Reviews already exist, skipping...');
      return;
    }

    for (const reviewSeed of reviewsSeed) {
      const user = await this.userRepository.findByEmail(reviewSeed.userEmail);

      if (!user || !user.id) {
        this.logger.warn('Skipping review: user not found');
        continue;
      }

      // Get restaurant ID from tracked list
      const restaurantId = this.restaurantSeedService.getRestaurantId(
        reviewSeed.restaurantIndex,
      );

      if (!restaurantId) {
        this.logger.warn(
          'Skipping review: restaurant not found in tracked IDs',
        );
        continue;
      }

      // Create review entity
      const reviewId = randomUUID();
      const review = Review.create(
        {
          userId: user.id,
          restaurantId,
          rating: reviewSeed.rating,
          comment: reviewSeed.comment,
          createdAt: reviewSeed.createdAt,
        },
        reviewId,
      );

      await this.reviewRepository.save(review);
    }

    this.logger.log(`✅ Created ${reviewsSeed.length} reviews`);
  }
}
