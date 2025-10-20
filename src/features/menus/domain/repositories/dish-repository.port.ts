import { IBaseRepositoryPort } from '@shared/application/ports/base-repo-port';

import { DishEntity } from '../entities/dish.entity';
import { DishCreate, DishUpdate } from '../types';

export abstract class IDishRepositoryPort extends IBaseRepositoryPort<
  DishEntity,
  DishCreate,
  DishUpdate
> {}
