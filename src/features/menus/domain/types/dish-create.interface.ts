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
