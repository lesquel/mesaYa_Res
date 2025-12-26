import type { DishProps } from './dish-props.interface';

export interface DishSnapshot extends DishProps {
  dishId: string;
  createdAt: Date;
  updatedAt: Date;
}
