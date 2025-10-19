import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

import { MenuEntity } from '../entities/menu.entity';
import { MenuCreate, MenuUpdate } from '../types';

export abstract class IMenuRepositoryPort extends IBaseRepositoryPort<
  MenuEntity,
  MenuCreate,
  MenuUpdate
> {}
