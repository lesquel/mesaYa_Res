import { MoneyVO } from '@shared/domain/entities/values';
import { DishUpdate } from './dish-update.interface';

export interface MenuUpdate {
  menuId: string;
  name?: string;
  description?: string;
  price?: MoneyVO;
  imageId?: string | null;
  dishes?: DishUpdate[];
}
