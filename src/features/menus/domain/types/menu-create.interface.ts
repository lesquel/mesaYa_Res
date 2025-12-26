import { MoneyVO } from '@shared/domain/entities/values';
import { DishCreate } from './dish-create.interface';

export interface MenuCreate {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId: string | null;
  dishes?: DishCreate[];
}
