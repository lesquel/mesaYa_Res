import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import type { SectionRepositoryPort } from '@features/sections/application/ports/section-repository.port';
import { SECTION_REPOSITORY } from '@features/sections/application/ports/section-repository.port';
import type { TableRepositoryPort } from '@features/tables/application/ports/table-repository.port';
import { TABLE_REPOSITORY } from '@features/tables/application/ports/table-repository.port';
import type { AuthUserRepositoryPort } from '@features/auth/application/ports/user.repository.port';
import { AUTH_USER_REPOSITORY } from '@features/auth/application/ports/user.repository.port';
import { RestaurantEntity } from '@features/restaurants/domain/entities/restaurant.entity';
import { Section } from '@features/sections/domain/entities/section.entity';
import { Table } from '@features/tables/domain/entities/table.entity';
import { restaurantsSeed, sectionsSeed, tablesSeed } from '../data';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RestaurantSeedService {
  private readonly logger = new Logger(RestaurantSeedService.name);
  private restaurantIds: string[] = []; // Track created restaurant IDs
  private sectionIds: string[] = []; // Track created section IDs

  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    @Inject(AUTH_USER_REPOSITORY)
    private readonly userRepository: AuthUserRepositoryPort,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: TableRepositoryPort,
  ) {}

  async seedRestaurants(): Promise<void> {
    this.logger.log('🍽️  Seeding restaurants...');

    // Check if restaurants exist - use a known check or skip for clean DB
    const checkId = 'seed-check-restaurant';
    const existing = await this.restaurantRepository.findById(checkId);
    if (existing) {
      this.logger.log('⏭️  Restaurants already exist, skipping...');
      return;
    }

    for (const restaurantSeed of restaurantsSeed) {
      const owner = await this.userRepository.findByEmail(
        restaurantSeed.ownerEmail,
      );

      if (!owner || !owner.id) {
        this.logger.warn(
          `Skipping restaurant ${restaurantSeed.name}: owner not found`,
        );
        continue;
      }

      const restaurantId = randomUUID();
      const restaurant = RestaurantEntity.create(
        {
          name: restaurantSeed.name,
          description: restaurantSeed.description,
          location: restaurantSeed.location,
          openTime: restaurantSeed.openTime,
          closeTime: restaurantSeed.closeTime,
          daysOpen: restaurantSeed.daysOpen as any, // Type conversion needed
          totalCapacity: restaurantSeed.totalCapacity,
          subscriptionId: 'subscription-placeholder', // Placeholder UUID - will be updated after subscriptions
          ownerId: owner.id,
          active: restaurantSeed.active,
        },
        restaurantId,
      );

      await this.restaurantRepository.save(restaurant);
      this.restaurantIds.push(restaurantId);
    }

    this.logger.log(`✅ Created ${restaurantsSeed.length} restaurants`);
  }

  async seedSections(): Promise<void> {
    this.logger.log('📐 Seeding sections...');

    // Check if sections exist
    const checkId = 'seed-check-section';
    const existing = await this.sectionRepository.findById(checkId);
    if (existing) {
      this.logger.log('⏭️  Sections already exist, skipping...');
      return;
    }

    for (const sectionSeed of sectionsSeed) {
      // Use the restaurant ID from our tracked list
      const restaurantId = this.restaurantIds[sectionSeed.restaurantIndex];

      if (!restaurantId) {
        this.logger.warn(
          'Skipping section: restaurant not found in tracked IDs',
        );
        continue;
      }

      const sectionId = randomUUID();
      const section = Section.create(
        {
          restaurantId,
          name: sectionSeed.name,
          description: sectionSeed.description,
          width: sectionSeed.width,
          height: sectionSeed.height,
        },
        sectionId,
      );

      await this.sectionRepository.save(section);
      this.sectionIds.push(sectionId);
    }

    this.logger.log(`✅ Created ${sectionsSeed.length} sections`);
  }

  async seedTables(): Promise<void> {
    this.logger.log('🪑 Seeding tables...');

    // Check if tables exist
    const checkId = 'seed-check-table';
    const existing = await this.tableRepository.findById(checkId);
    if (existing) {
      this.logger.log('⏭️  Tables already exist, skipping...');
      return;
    }

    for (const tableSeed of tablesSeed) {
      // Use the section ID from our tracked list
      const sectionId = this.sectionIds[tableSeed.sectionIndex];

      if (!sectionId) {
        this.logger.warn('Skipping table: section not found in tracked IDs');
        continue;
      }

      const tableId = randomUUID();
      const table = Table.create(tableId, {
        sectionId,
        number: tableSeed.number,
        capacity: tableSeed.capacity,
        posX: tableSeed.posX,
        posY: tableSeed.posY,
        width: tableSeed.width,
        tableImageId: tableSeed.tableImageId,
        chairImageId: tableSeed.chairImageId,
      });

      await this.tableRepository.save(table);
    }

    this.logger.log(`✅ Created ${tablesSeed.length} tables`);
  }

  /**
   * Obtiene el ID del restaurante creado según su índice.
   * Útil para que otros servicios de seed puedan referenciar restaurantes.
   *
   * @param {number} index - Índice del restaurante (0-based)
   * @returns {string | undefined} - ID del restaurante o undefined si no existe
   */
  getRestaurantId(index: number): string | undefined {
    return this.restaurantIds[index];
  }

  /**
   * Obtiene todos los IDs de restaurantes creados.
   *
   * @returns {string[]} - Array de IDs de restaurantes
   */
  getRestaurantIds(): string[] {
    return [...this.restaurantIds];
  }
}
