import { DishDto } from './dish.dto';
import { PaginatedResult } from '@shared/application/types';

export type DishListResponseDto = PaginatedResult<DishDto>;
