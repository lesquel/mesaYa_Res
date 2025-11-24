import {
  MenuCategoryProps,
  MenuCategoryRecord,
  MenuCategoryUpdate,
} from '../types';

export class MenuCategoryEntity {
  private constructor(
    private readonly categoryId: string,
    private props: MenuCategoryProps,
  ) {}

  static create(id: string, props: MenuCategoryProps): MenuCategoryEntity {
    this.validate(props);
    return new MenuCategoryEntity(id, props);
  }

  static rehydrate(record: MenuCategoryRecord): MenuCategoryEntity {
    const { categoryId, createdAt, updatedAt, ...rest } = record;
    return new MenuCategoryEntity(categoryId, {
      ...rest,
      createdAt,
      updatedAt,
    });
  }

  snapshot(): MenuCategoryRecord {
    return {
      categoryId: this.categoryId,
      ...this.props,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }

  update(update: MenuCategoryUpdate): void {
    const next: MenuCategoryProps = {
      ...this.props,
      ...update,
    };

    MenuCategoryEntity.validate(next);
    this.props = next;
  }

  get id(): string {
    return this.categoryId;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get icon(): string | null | undefined {
    return this.props.icon;
  }

  get position(): number | null | undefined {
    return this.props.position;
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  private static validate(props: MenuCategoryProps): void {
    if (!props.restaurantId || !props.restaurantId.trim()) {
      throw new Error('Menu category must reference a restaurant');
    }

    if (!props.name || !props.name.trim()) {
      throw new Error('Menu category must have a name');
    }
  }
}