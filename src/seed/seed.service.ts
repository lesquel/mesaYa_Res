import { Injectable, Logger } from '@nestjs/common';
import {
  SubscriptionSeedService,
  MediaSeedService,
  RestaurantSeedService,
  MenuSeedService,
  CustomerSeedService,
  PaymentSeedService,
} from './services';

/**
 * Servicio principal orquestador del seeding de la base de datos.
 * Coordina la ejecución ordenada de los servicios de seed individuales.
 *
 * @class SeedService
 * @description
 * Este servicio sigue el patrón de Fachada (Facade Pattern) para proporcionar
 * una interfaz simple para ejecutar todos los seeds del sistema.
 * Delega la lógica específica a servicios especializados siguiendo el
 * Principio de Responsabilidad Única (SRP).
 *
 * NOTE: Auth seeding (users, roles, permissions) is now handled by Auth MS.
 * This service only seeds business data that depends on users already existing.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly subscriptionSeedService: SubscriptionSeedService,
    private readonly mediaSeedService: MediaSeedService,
    private readonly restaurantSeedService: RestaurantSeedService,
    private readonly menuSeedService: MenuSeedService,
    private readonly customerSeedService: CustomerSeedService,
    private readonly paymentSeedService: PaymentSeedService,
  ) {}

  /**
   * Ejecuta el proceso completo de seeding de la base de datos.
   *
   * @returns {Promise<{ message: string; success: boolean }>}
   * Objeto con el mensaje de éxito y estado de la operación
   *
   * @throws {Error} Si ocurre algún error durante el seeding
   *
   * @example
   * ```typescript
   * const result = await seedService.execute();
   * console.log(result); // { message: 'Database seeded successfully', success: true }
   * ```
   *
   * @note Auth seeding (users, roles, permissions) is handled by Auth MS on startup.
   *       Make sure Auth MS has started before running this seed.
   */
  async execute(): Promise<{ message: string; success: boolean }> {
    try {
      this.logger.log('🌱 Starting database seeding...');
      this.logger.log(
        '📝 Note: Auth data (users, roles, permissions) is seeded by Auth MS',
      );

      // Fase 1: Configuración del sistema
      await this.subscriptionSeedService.seedSubscriptionPlans();
      await this.mediaSeedService.seedImages();
      await this.mediaSeedService.seedGraphicObjects();

      // Fase 2: Datos del negocio
      await this.restaurantSeedService.seedRestaurants();
      await this.subscriptionSeedService.seedSubscriptions();
      await this.restaurantSeedService.seedSections();
      await this.restaurantSeedService.seedTables();

      // Fase 3: Contenido
      await this.menuSeedService.seedMenus();
      await this.menuSeedService.seedDishes();

      // Fase 4: Interacciones del cliente
      await this.customerSeedService.seedReservations();
      await this.customerSeedService.seedReviews();

      // Fase 5: Pagos
      await this.paymentSeedService.seedPayments();

      this.logger.log('✅ Database seeding completed successfully!');

      return {
        message: 'Database seeded successfully',
        success: true,
      };
    } catch (error) {
      this.logger.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}
