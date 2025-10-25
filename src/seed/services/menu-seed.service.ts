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

    const existing = await this.menuRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Menus already exist, skipping...');
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

      const menu = await this.menuRepository.create({
        restaurantId: restaurantId,
        name: menuSeed.name,
        description: menuSeed.description,
        price: menuSeed.price,
        imageUrl: menuSeed.imageUrl,
      });

      this.menuIds.push(menu.id);
    }

    this.logger.log(`✅ Created ${menusSeed.length} menus`);
  }

  async seedDishes(): Promise<void> {
    this.logger.log('🍝 Seeding dishes...');

    const existing = await this.dishRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Dishes already exist, skipping...');
      return;
    }

    for (const dishSeed of dishesSeed) {
      // Usar el índice del menú para obtener el restaurantId correspondiente
      const menuData = menusSeed[dishSeed.menuIndex];
      const restaurantId = menuData
        ? this.restaurantSeedService.getRestaurantId(menuData.restaurantIndex)
        : undefined;

      if (!restaurantId) {
        this.logger.warn(
          `Skipping dish "${dishSeed.name}": restaurant not found`,
        );
        continue;
      }

      await this.dishRepository.create({
        restaurantId: restaurantId,
        name: dishSeed.name,
        description: dishSeed.description,
        price: dishSeed.price,
        imageId: undefined,
      });
    }

    this.logger.log(`✅ Created ${dishesSeed.length} dishes`);
  }
}
