import { MoneyVO } from '@shared/domain/entities/values';

export interface DishCreate {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId?: string;
  menuId?: string;
}

export interface DishUpdate {
  dishId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageId?: string | null;
  menuId?: string | null;
}
