import { MoneyVO } from '@shared/domain/entities/values';

export interface DishCreate {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId?: string;
  menuId?: string;
  categoryId?: string;
  categoryName?: string;
  categoryDescription?: string | null;
  categoryOrder?: number;
}

export interface DishUpdate {
  dishId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageId?: string | null;
  menuId?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryDescription?: string | null;
  categoryOrder?: number | null;
}
