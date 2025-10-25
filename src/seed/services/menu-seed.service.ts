import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMenuRepositoryPort } from '@features/menus/domain/repositories/menu-repository.port';
import { IDishRepositoryPort } from '@features/menus/domain/repositories/dish-repository.port';
import { menusSeed, dishesSeed } from '../data';

@Injectable()
export class MenuSeedService {
  private readonly logger = new Logger(MenuSeedService.name);
  private menuIds: string[] = []; // Track created menu IDs

  constructor(
    @Inject(IMenuRepositoryPort)
    private readonly menuRepository: IMenuRepositoryPort,
    @Inject(IDishRepositoryPort)
    private readonly dishRepository: IDishRepositoryPort,
  ) {}

  async seedMenus(): Promise<void> {
    this.logger.log('📖 Seeding menus...');

    const existing = await this.menuRepository.findAll();
    if (existing.length > 0) {
      this.logger.log('⏭️  Menus already exist, skipping...');
      return;
    }

    for (const menuSeed of menusSeed) {
      const menu = await this.menuRepository.create({
        restaurantId: `restaurant-${menuSeed.restaurantIndex}`, // Will be updated with real IDs
        name: menuSeed.name,
        description: menuSeed.description,
        price: menuSeed.price,
        imageUrl: menuSeed.imageUrl,
      });

      this.menuIds.push(menu.id!);
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
      const menuId = this.menuIds[dishSeed.menuIndex];

      if (!menuId) {
        this.logger.warn('Skipping dish: menu not found in tracked IDs');
        continue;
      }

      await this.dishRepository.create({
        restaurantId: 'temp-restaurant-id', // Will need real restaurant ID
        menuId,
        name: dishSeed.name,
        description: dishSeed.description,
        price: dishSeed.price,
        imageId: null,
      });
    }

    this.logger.log(`✅ Created ${dishesSeed.length} dishes`);
  }
}
