import { DishDto } from './dish.dto';
import { PaginatedResult } from '@shared/application/types/pagination';

export type DishListResponseDto = PaginatedResult<DishDto>;
