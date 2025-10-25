import { Injectable, Logger } from '@nestjs/common';
import {
  AuthSeedService,
  UserSeedService,
  SubscriptionSeedService,
  MediaSeedService,
  RestaurantSeedService,
  MenuSeedService,
  CustomerSeedService,
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
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly authSeedService: AuthSeedService,
    private readonly userSeedService: UserSeedService,
    private readonly subscriptionSeedService: SubscriptionSeedService,
    private readonly mediaSeedService: MediaSeedService,
    private readonly restaurantSeedService: RestaurantSeedService,
    private readonly menuSeedService: MenuSeedService,
    private readonly customerSeedService: CustomerSeedService,
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
   */
  async execute(): Promise<{ message: string; success: boolean }> {
    try {
      this.logger.log('🌱 Starting database seeding...');

      // Fase 1: Autenticación y autorización
      await this.authSeedService.seedPermissions();
      await this.authSeedService.seedRoles();
      await this.userSeedService.seedUsers();

      // Fase 2: Configuración del sistema
      await this.subscriptionSeedService.seedSubscriptionPlans();
      await this.mediaSeedService.seedImages();
      await this.mediaSeedService.seedGraphicObjects();

      // Fase 3: Datos del negocio
      await this.restaurantSeedService.seedRestaurants();
      await this.subscriptionSeedService.seedSubscriptions();
      await this.restaurantSeedService.seedSections();
      await this.restaurantSeedService.seedTables();

      // Fase 4: Contenido
      await this.menuSeedService.seedMenus();
      await this.menuSeedService.seedDishes();

      // Fase 5: Interacciones del cliente
      await this.customerSeedService.seedReservations();
      await this.customerSeedService.seedReviews();

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
