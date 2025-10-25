import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ReservationRepositoryPort } from '@features/reservation/application/ports/reservation-repository.port';
import { RESERVATION_REPOSITORY } from '@features/reservation/application/ports/reservation-repository.port';
import type { ReviewRepositoryPort } from '@features/reviews/application/ports/review-repository.port';
import { REVIEW_REPOSITORY } from '@features/reviews/application/ports/review-repository.port';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/application/ports/user.repository.port';
import { reservationsSeed, reviewsSeed } from '../data';
import { randomUUID } from 'node:crypto';

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

      // NOTE: In a real scenario, you'd need to properly resolve restaurant and table IDs
      // For seeding purposes, we'll use placeholder IDs that should be replaced
      const reservationId = randomUUID();

      // Simplified reservation creation - adjust based on actual ReservationEntity structure
      const reservationDateTime = new Date(reservationSeed.reservationDate);
      const [hours, minutes] = reservationSeed.reservationTime.split(':');
      reservationDateTime.setHours(Number.parseInt(hours, 10));
      reservationDateTime.setMinutes(Number.parseInt(minutes, 10));

      // This will need to be adjusted based on your actual Reservation entity create method
      // Skipping actual save due to missing dependencies (restaurant, table)
      this.logger.warn(
        `Reservation for ${user.email} - needs proper restaurant/table resolution`,
      );
    }

    this.logger.log(
      `⏭️ Skipped ${reservationsSeed.length} reservations (need proper entity setup)`,
    );
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

      // NOTE: Similar to reservations, this needs proper restaurant ID resolution
      // Skipping actual save due to missing restaurant dependency
      this.logger.warn(
        `Review from ${user.email} - needs proper restaurant resolution`,
      );
    }

    this.logger.log(
      `⏭️ Skipped ${reviewsSeed.length} reviews (need proper entity setup)`,
    );
  }
}
