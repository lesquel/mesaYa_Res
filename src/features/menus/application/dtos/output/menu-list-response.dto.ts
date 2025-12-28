import { PaginatedResult } from '@shared/application/types';
import { MenuDto } from './menu.dto';

export type MenuListResponseDto = PaginatedResult<MenuDto>;
