import { MoneyVO } from '@shared/domain/entities/values';

export interface DishCreate {
  restaurantId: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageId?: number;
}

export interface DishUpdate {
  dishId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageId?: number | null;
}
