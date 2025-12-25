import { MoneyVO } from '@shared/domain/entities/values';
import type { DishSnapshot } from './dish.entity';
import type { MenuCategorySnapshot, MenuProps, MenuSnapshot } from '../types';

// Re-export for backward compatibility
export type { MenuProps, MenuSnapshot } from '../types';

export class MenuEntity {
  private constructor(
    private readonly menuId: string,
    private props: MenuProps,
  ) {}

  static create(id: string, props: MenuProps): MenuEntity {
    this.validate(props);
    return new MenuEntity(id, props);
  }

  static rehydrate(snapshot: MenuSnapshot): MenuEntity {
    const { menuId, ...rest } = snapshot;
    return new MenuEntity(menuId, rest);
  }

  snapshot(): MenuSnapshot {
    return {
      menuId: this.menuId,
      ...this.props,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }

  update(update: Partial<MenuProps>): void {
    const next: MenuProps = {
      ...this.props,
      ...update,
    };

    MenuEntity.validate(next);
    this.props = next;
  }

  replaceDishes(dishes: DishSnapshot[]): void {
    this.props = {
      ...this.props,
      dishes: [...dishes],
    };
  }

  get id(): string {
    return this.menuId;
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

  get imageId(): string | null {
    return this.props.imageId;
  }

  get dishes(): DishSnapshot[] | undefined {
    return this.props.dishes;
  }

  get categories(): MenuCategorySnapshot[] | undefined {
    return this.props.categories;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  replaceCategories(categories: MenuCategorySnapshot[]): void {
    this.props = {
      ...this.props,
      categories: [...categories],
    };
  }

  private static validate(props: MenuProps): void {
    if (!props.name || !props.name.trim()) {
      throw new Error('Menu must have a valid name');
    }

    if (!props.description || !props.description.trim()) {
      throw new Error('Menu must have a valid description');
    }

    if (!(props.price instanceof MoneyVO)) {
      throw new Error('Menu must have a valid price value object');
    }

    if (!props.restaurantId || !props.restaurantId.trim()) {
      throw new Error('Menu must reference a valid restaurant');
    }
  }
}
