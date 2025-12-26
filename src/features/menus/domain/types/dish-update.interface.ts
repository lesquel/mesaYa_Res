import { MoneyVO } from '@shared/domain/entities/values';

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
