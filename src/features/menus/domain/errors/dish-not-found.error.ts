import { NotFoundError } from '@shared/domain/errors/not-found.error';

export class DishNotFoundError extends NotFoundError {
  constructor(dishId: string) {
    super(`Dish with ID '${dishId}' not found`, { dishId });
    this.name = DishNotFoundError.name;
  }
}
