import { PaginatedResult } from '@shared/application/types/pagination';
import { MenuDto } from './menu.dto';

export type MenuListResponseDto = PaginatedResult<MenuDto>;
