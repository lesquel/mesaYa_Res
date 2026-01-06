import { Injectable, Logger, Inject } from '@nestjs/common';
import type { RestaurantRepositoryPort } from '@features/restaurants/application/ports/restaurant-repository.port';
import { RESTAURANT_REPOSITORY } from '@features/restaurants/application/ports/restaurant-repository.port';
import type { SectionRepositoryPort } from '@features/sections/application/ports/section-repository.port';
import { SECTION_REPOSITORY } from '@features/sections/application/ports/section-repository.port';
import type { TableRepositoryPort } from '@features/tables/application/ports/table-repository.port';
import { TABLE_REPOSITORY } from '@features/tables/application/ports/table-repository.port';
import { AuthProxyService } from '@features/auth/infrastructure/messaging/auth-proxy.service';
import { RestaurantEntity } from '@features/restaurants/domain/entities/restaurant.entity';
import type { RestaurantDay } from '@features/restaurants/domain/entities/values/restaurant-day';
import { Section } from '@features/sections/domain/entities/section.entity';
import { Table } from '@features/tables/domain/entities/table.entity';
import { restaurantsSeed, sectionsSeed, tablesSeed } from '../data';
import { randomUUID } from 'node:crypto';
import { MediaSeedService } from './media-seed.service';

@Injectable()
export class RestaurantSeedService {
  private readonly logger = new Logger(RestaurantSeedService.name);
  private restaurantIds: string[] = []; // Track created restaurant IDs
  private sectionIds: string[] = []; // Track created section IDs
  private tableIds: string[] = []; // Track created table IDs

  constructor(
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: RestaurantRepositoryPort,
    private readonly authProxy: AuthProxyService,
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: TableRepositoryPort,
    private readonly mediaSeedService: MediaSeedService,
  ) {}

  async seedRestaurants(): Promise<void> {
    this.logger.log('🍽️  Seeding restaurants...');

    // Check if restaurants exist by verifying if we already have IDs tracked
    if (this.restaurantIds.length > 0) {
      this.logger.log(
        '⏭️  Restaurants already exist in this session, skipping...',
      );
      return;
    }

    for (const restaurantSeed of restaurantsSeed) {
      const ownerResponse = await this.authProxy.findUserByEmail(
        restaurantSeed.ownerEmail,
      );

      if (!ownerResponse.success || !ownerResponse.data) {
        this.logger.warn(
          `Skipping restaurant ${restaurantSeed.name}: owner not found in Auth MS`,
        );
        continue;
      }

      const ownerId = ownerResponse.data.id;

      const restaurantId = randomUUID();
      const restaurant = RestaurantEntity.create(
        {
          name: restaurantSeed.name,
          description: restaurantSeed.description,
          location: restaurantSeed.location,
          openTime: restaurantSeed.openTime,
          closeTime: restaurantSeed.closeTime,
          daysOpen: restaurantSeed.daysOpen as RestaurantDay[],
          totalCapacity: restaurantSeed.totalCapacity,
          subscriptionId: '00000000-0000-0000-0000-000000000000', // Placeholder UUID - will be updated after subscriptions
          ownerId,
          active: restaurantSeed.active,
        },
        restaurantId,
      );

      const savedRestaurant = await this.restaurantRepository.save(restaurant);
      this.restaurantIds.push(savedRestaurant.id); // Capturar ID retornado
    }

    this.logger.log(`✅ Created ${restaurantsSeed.length} restaurants`);
  }

  async seedSections(): Promise<void> {
    this.logger.log('📐 Seeding sections...');

    // Check if sections exist by verifying if we already have IDs tracked
    if (this.sectionIds.length > 0) {
      this.logger.log(
        '⏭️  Sections already exist in this session, skipping...',
      );
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

      const savedSection = await this.sectionRepository.save(section);
      this.sectionIds.push(savedSection.id); // Capturar ID retornado
    }

    this.logger.log(`✅ Created ${sectionsSeed.length} sections`);
  }

  async seedTables(): Promise<void> {
    this.logger.log('🪑 Seeding tables...');

    // Check if tables exist by verifying if we already have IDs tracked
    if (this.tableIds.length > 0) {
      this.logger.log('⏭️  Tables already exist in this session, skipping...');
      return;
    }

    for (const tableSeed of tablesSeed) {
      // Use the section ID from our tracked list
      const sectionId = this.sectionIds[tableSeed.sectionIndex];

      if (!sectionId) {
        this.logger.warn('Skipping table: section not found in tracked IDs');
        continue;
      }

      // Get graphic object IDs for table and chair images
      const tableImageId = this.mediaSeedService.getGraphicObjectId(
        tableSeed.tableImageIndex,
      );
      const chairImageId = this.mediaSeedService.getGraphicObjectId(
        tableSeed.chairImageIndex,
      );

      if (!tableImageId || !chairImageId) {
        this.logger.warn(
          'Skipping table: graphic objects not found in tracked IDs',
        );
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
        tableImageId,
        chairImageId,
      });

      const savedTable = await this.tableRepository.save(table);
      this.tableIds.push(savedTable.id); // Capturar ID retornado
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

  /**
   * Obtiene el ID de la mesa creada según su índice.
   * Útil para que otros servicios de seed puedan referenciar mesas.
   *
   * @param {number} index - Índice de la mesa (0-based)
   * @returns {string | undefined} - ID de la mesa o undefined si no existe
   */
  getTableId(index: number): string | undefined {
    return this.tableIds[index];
  }

  /**
   * Obtiene todos los IDs de mesas creadas.
   *
   * @returns {string[]} - Array de IDs de mesas
   */
  getTableIds(): string[] {
    return [...this.tableIds];
  }
}
