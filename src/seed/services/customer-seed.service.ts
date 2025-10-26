import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ReservationRepositoryPort } from '@features/reservation/application/ports/reservation-repository.port';
import { RESERVATION_REPOSITORY } from '@features/reservation/application/ports/reservation-repository.port';
import type { ReviewRepositoryPort } from '@features/reviews/application/ports/review-repository.port';
import { REVIEW_REPOSITORY } from '@features/reviews/application/ports/review-repository.port';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/auth.tokens';
import { ReservationEntity } from '@features/reservation/domain/entities/reservation.entity';
import { Review } from '@features/reviews/domain/entities/review.entity';
import { reservationsSeed, reviewsSeed } from '../data';
import { randomUUID } from 'node:crypto';
import { RestaurantSeedService } from './restaurant-seed.service';

@Injectable()
export class CustomerSeedService {
  private readonly logger = new Logger(CustomerSeedService.name);
  private reservationIds: string[] = []; // Track created reservation IDs
  private reviewIds: string[] = []; // Track created review IDs

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

    // Check if reservations exist by verifying if we already have IDs tracked
    if (this.reservationIds.length > 0) {
      this.logger.log(
        '⏭️  Reservations already exist in this session, skipping...',
      );
      return;
    }

    // Verificar que los restaurantes ya fueron creados
    const allRestaurantIds = this.restaurantSeedService.getRestaurantIds();
    if (allRestaurantIds.length === 0) {
      this.logger.warn('⚠️  No restaurants found, cannot seed reservations');
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

      // Create reservation entity (UUID generado en el dominio)
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

      const savedReservation =
        await this.reservationRepository.save(reservation);
      this.reservationIds.push(savedReservation.id);
    }

    this.logger.log(`✅ Created ${reservationsSeed.length} reservations`);
  }

  async seedReviews(): Promise<void> {
    this.logger.log('⭐ Seeding reviews...');

    // Check if reviews exist by verifying if we already have IDs tracked
    if (this.reviewIds.length > 0) {
      this.logger.log('⏭️  Reviews already exist in this session, skipping...');
      return;
    }

    // Verificar que los restaurantes ya fueron creados
    const allRestaurantIds = this.restaurantSeedService.getRestaurantIds();
    if (allRestaurantIds.length === 0) {
      this.logger.warn('⚠️  No restaurants found, cannot seed reviews');
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

      // Create review entity (UUID generado en el dominio)
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

      const savedReview = await this.reviewRepository.save(review);
      this.reviewIds.push(savedReview.id);
    }

    this.logger.log(`✅ Created ${reviewsSeed.length} reviews`);
  }

  /**
   * Obtiene el ID de la reservación creada según su índice.
   *
   * @param {number} index - Índice de la reservación (0-based)
   * @returns {string | undefined} - ID de la reservación o undefined si no existe
   */
  getReservationId(index: number): string | undefined {
    return this.reservationIds[index];
  }

  /**
   * Obtiene el ID de la review creada según su índice.
   *
   * @param {number} index - Índice de la review (0-based)
   * @returns {string | undefined} - ID de la review o undefined si no existe
   */
  getReviewId(index: number): string | undefined {
    return this.reviewIds[index];
  }
}
