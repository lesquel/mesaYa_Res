import { MoneyVO } from '@shared/domain/entities/values';

export interface DishProps {
  restaurantId: string;
  name: string;
  description: string;
  price: MoneyVO;
  imageId?: string;
  menuId?: string;
  categoryId?: string;
  categoryName?: string;
  categoryDescription?: string | null;
  categoryOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DishSnapshot extends DishProps {
  dishId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DishEntity {
  private constructor(
    private readonly dishId: string,
    private props: DishProps,
  ) {}

  static create(id: string, props: DishProps): DishEntity {
    this.validate(props);
    return new DishEntity(id, props);
  }

  static rehydrate(snapshot: DishSnapshot): DishEntity {
    const { dishId, ...rest } = snapshot;
    return new DishEntity(dishId, rest);
  }

  snapshot(): DishSnapshot {
    return {
      dishId: this.dishId,
      ...this.props,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }

  update(update: Partial<DishProps>): void {
    const next: DishProps = {
      ...this.props,
      ...update,
    };

    DishEntity.validate(next);
    this.props = next;
  }

  get id(): string {
    return this.dishId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): MoneyVO {
    return this.props.price;
  }

  get imageId(): string | undefined {
    return this.props.imageId;
  }

  get menuId(): string | undefined {
    return this.props.menuId;
  }

  get categoryId(): string | undefined {
    return this.props.categoryId;
  }

  get categoryName(): string | undefined {
    return this.props.categoryName;
  }

  get categoryDescription(): string | null | undefined {
    return this.props.categoryDescription;
  }

  get categoryOrder(): number | undefined {
    return this.props.categoryOrder;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  private static validate(props: DishProps): void {
    if (!props.name || !props.name.trim()) {
      throw new Error('Dish must have a valid name');
    }

    if (!props.description || !props.description.trim()) {
      throw new Error('Dish must have a valid description');
    }

    if (!(props.price instanceof MoneyVO)) {
      throw new Error('Dish must have a valid price value object');
    }

    if (!props.restaurantId || !props.restaurantId.trim()) {
      throw new Error('Dish must reference a valid restaurant');
    }

    if (props.imageId !== undefined && !props.imageId.trim()) {
      throw new Error('Dish cannot reference an empty imageId');
    }

    if (props.menuId !== undefined && !props.menuId.trim()) {
      throw new Error('Dish cannot reference an empty menuId');
    }
  }
}
