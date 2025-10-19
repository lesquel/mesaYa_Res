import { MoneyVO } from '@shared/domain/entities/values';
import { DishSnapshot } from './dish.entity';

export interface MenuProps {
  restaurantId: number;
  name: string;
  description: string;
  price: MoneyVO;
  imageUrl: string;
  dishes?: DishSnapshot[];
}

export interface MenuSnapshot extends MenuProps {
  menuId: string;
}

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

  replacePlatillos(dishes: DishSnapshot[]): void {
    this.props = {
      ...this.props,
      dishes: [...dishes],
    };
  }

  get id(): string {
    return this.menuId;
  }

  get restaurantId(): number {
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

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get dishes(): DishSnapshot[] | undefined {
    return this.props.dishes;
  }

  private static validate(props: MenuProps): void {
    if (!props.name || !props.name.trim()) {
      throw new Error('Menu must have a valid nombre');
    }

    if (!props.description || !props.description.trim()) {
      throw new Error('Menu must have a valid descripcion');
    }

    if (!props.imageUrl || !props.imageUrl.trim()) {
      throw new Error('Menu must have a valid fotoUrl');
    }

    if (!(props.price instanceof MoneyVO)) {
      throw new Error('Menu must have a valid precio value object');
    }

    if (props.restaurantId <= 0) {
      throw new Error('Menu must reference a valid restaurante');
    }
  }
}
