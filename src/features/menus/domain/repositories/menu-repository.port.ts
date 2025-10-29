import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

import { PaginatedResult } from '@shared/application/types/pagination';
import { MenuEntity } from '../entities/menu.entity';
import { MenuCreate, MenuUpdate, MenuPaginatedQuery } from '../types';

export abstract class IMenuRepositoryPort extends IBaseRepositoryPort<
  MenuEntity,
  MenuCreate,
  MenuUpdate
> {
  abstract paginate(
    query: MenuPaginatedQuery,
  ): Promise<PaginatedResult<MenuEntity>>;
}
