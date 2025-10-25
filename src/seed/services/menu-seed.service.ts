import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMenuRepositoryPort } from '@features/menus/domain/repositories/menu-repository.port';
import { IDishRepositoryPort } from '@features/menus/domain/repositories/dish-repository.port';
import { menusSeed, dishesSeed } from '../data';

@Injectable()
export class MenuSeedService {
  private readonly logger = new Logger(MenuSeedService.name);
  private dishIds: string[][] = []; // Track created dish IDs per menu

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

    // Note: Cannot link to restaurants without restaurantId tracking from RestaurantSeedService
    this.logger.warn(
      '⚠️  Creating menus with placeholder restaurantId. Update manually or via API.',
    );

    for (const menuSeed of menusSeed) {
      await this.menuRepository.create({
        restaurantId: 1, // Placeholder - needs real restaurant ID
        name: menuSeed.name,
        description: menuSeed.description,
        price: menuSeed.price,
        imageUrl: menuSeed.imageUrl,
      });
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
      await this.dishRepository.create({
        restaurantId: 1, // Placeholder - needs real restaurant ID
        name: dishSeed.name,
        description: dishSeed.description,
        price: dishSeed.price,
        imageId: undefined,
      });
    }

    this.logger.log(`✅ Created ${dishesSeed.length} dishes`);
  }
}
