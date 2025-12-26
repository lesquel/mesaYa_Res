import type { MoneyVO } from '@shared/domain/entities/values';
import type { DishSnapshot } from '../entities/dish.entity';
import type { MenuCategorySnapshot } from './menu-category-snapshot.interface';

export interface MenuProps {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId: string | null;
  dishes?: DishSnapshot[];
  categories?: MenuCategorySnapshot[];
  createdAt?: Date;
  updatedAt?: Date;
}
