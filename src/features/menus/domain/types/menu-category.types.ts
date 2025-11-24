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

export interface MenuCategoryProps {
  restaurantId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  position?: number | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuCategoryCreate extends MenuCategoryProps {}

export interface MenuCategoryUpdate {
  categoryId: string;
  name?: string;
  description?: string | null;
  icon?: string | null;
  position?: number | null;
  isActive?: boolean;
}

export interface MenuCategoryRecord extends MenuCategoryProps {
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategoryQuery {
  restaurantId?: string;
}
