import type { DishSnapshot } from '../entities/dish.entity';

export interface MenuCategorySnapshot {
  categoryId: string;
  menuId: string;
  name: string;
  description?: string | null;
  order: number;
  dishes: DishSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}
