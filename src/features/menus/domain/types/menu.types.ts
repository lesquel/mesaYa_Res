import { MoneyVO } from '@shared/domain/entities/values';
import { DishCreate, DishUpdate } from './dish.types';

export interface MenuCreate {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
  dishes?: DishCreate[];
}

export interface MenuUpdate {
  menuId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageUrl?: string;
  dishes?: DishUpdate[];
}
