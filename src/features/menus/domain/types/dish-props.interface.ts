import type { MoneyVO } from '@shared/domain/entities/values';

export interface DishProps {
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
  createdAt?: Date;
  updatedAt?: Date;
}
