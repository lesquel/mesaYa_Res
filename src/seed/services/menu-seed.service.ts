import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMenuRepositoryPort } from '@features/menus/domain/repositories/menu-repository.port';
import { IDishRepositoryPort } from '@features/menus/domain/repositories/dish-repository.port';
import { menusSeed, dishesSeed } from '../data';
import { RestaurantSeedService } from './restaurant-seed.service';

@Injectable()
export class MenuSeedService {
  private readonly logger = new Logger(MenuSeedService.name);
  private menuIds: string[] = []; // Track created menu IDs

  constructor(
    @Inject(IMenuRepositoryPort)
    private readonly menuRepository: IMenuRepositoryPort,
    @Inject(IDishRepositoryPort)
    private readonly dishRepository: IDishRepositoryPort,
    private readonly restaurantSeedService: RestaurantSeedService,
  ) {}

  async seedMenus(): Promise<void> {
    this.logger.log('📖 Seeding menus...');

    // Check if menus exist by verifying if we already have IDs tracked
    if (this.menuIds.length > 0) {
      this.logger.log('⏭️  Menus already exist in this session, skipping...');
      return;
    }

    for (const menuSeed of menusSeed) {
      // Obtener el ID real del restaurante desde RestaurantSeedService
      const restaurantId = this.restaurantSeedService.getRestaurantId(
        menuSeed.restaurantIndex,
      );

      if (!restaurantId) {
        this.logger.warn(
          `Skipping menu "${menuSeed.name}": restaurant not found at index ${menuSeed.restaurantIndex}`,
        );
        continue;
      }

      // Crear el menú y capturar el ID generado por la base de datos
      const menu = await this.menuRepository.create({
        restaurantId: restaurantId,
        name: menuSeed.name,
        description: menuSeed.description,
        price: menuSeed.price,
        imageUrl: menuSeed.imageUrl,
      });

      // Guardar el ID generado automáticamente
      this.menuIds.push(menu.id);
    }

    this.logger.log(`✅ Created ${menusSeed.length} menus`);
  }

  async seedDishes(): Promise<void> {
    this.logger.log('🍝 Seeding dishes...');

    // Verificar que los menús ya fueron creados
    if (this.menuIds.length === 0) {
      this.logger.warn('⚠️  No menus found, cannot seed dishes');
      return;
    }

    for (const dishSeed of dishesSeed) {
      // Usar el índice del menú para obtener el restaurantId correspondiente
      const menuData = menusSeed[dishSeed.menuIndex];

      if (!menuData) {
        this.logger.warn(
          `Skipping dish "${dishSeed.name}": menu not found at index ${dishSeed.menuIndex}`,
        );
        continue;
      }

      const restaurantId = this.restaurantSeedService.getRestaurantId(
        menuData.restaurantIndex,
      );

      if (!restaurantId) {
        this.logger.warn(
          `Skipping dish "${dishSeed.name}": restaurant not found`,
        );
        continue;
      }

      // Obtener el menuId correspondiente del array de IDs capturados
      const menuId = this.menuIds[dishSeed.menuIndex];

      if (!menuId) {
        this.logger.warn(
          `Skipping dish "${dishSeed.name}": menu ID not found at index ${dishSeed.menuIndex}`,
        );
        continue;
      }

      // Crear el dish con el menuId capturado
      await this.dishRepository.create({
        restaurantId: restaurantId,
        name: dishSeed.name,
        description: dishSeed.description,
        price: dishSeed.price,
        imageId: undefined,
        menuId: menuId,
      });
    }

    this.logger.log(`✅ Created ${dishesSeed.length} dishes`);
  }

  /**
   * Obtiene el ID del menú creado según su índice.
   * Útil para que otros servicios de seed puedan referenciar menús.
   *
   * @param {number} index - Índice del menú (0-based)
   * @returns {string | undefined} - ID del menú o undefined si no existe
   */
  getMenuId(index: number): string | undefined {
    return this.menuIds[index];
  }

  /**
   * Obtiene todos los IDs de menús creados.
   *
   * @returns {string[]} - Array de IDs de menús
   */
  getMenuIds(): string[] {
    return [...this.menuIds];
  }
}
