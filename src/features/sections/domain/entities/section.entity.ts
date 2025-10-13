import { randomUUID } from 'node:crypto';
import {
  SectionDescription,
  SectionHeight,
  SectionName,
  SectionRestaurantId,
  SectionWidth,
} from './values/index.js';
import {
  type SectionCreate,
  type SectionSnapshot,
  type SectionUpdate,
} from '../types/index.js';

interface SectionProps {
  restaurantId: SectionRestaurantId;
  name: SectionName;
  description: SectionDescription;
  width: SectionWidth;
  height: SectionHeight;
}

export class Section {
  private constructor(
    private props: SectionProps,
    private readonly internalId: string,
  ) {}

  static create(props: SectionCreate, id: string = randomUUID()): Section {
    const aggregated: SectionProps = {
      restaurantId: new SectionRestaurantId(props.restaurantId),
      name: new SectionName(props.name),
      description: SectionDescription.create(props.description ?? null),
      width: new SectionWidth(props.width),
      height: new SectionHeight(props.height),
    };

    return new Section(aggregated, id);
  }

  static rehydrate(snapshot: SectionSnapshot): Section {
    const aggregated: SectionProps = {
      restaurantId: new SectionRestaurantId(snapshot.restaurantId),
      name: new SectionName(snapshot.name),
      description: SectionDescription.create(snapshot.description),
      width: new SectionWidth(snapshot.width),
      height: new SectionHeight(snapshot.height),
    };

    return new Section(aggregated, snapshot.id);
  }

  get id(): string {
    return this.internalId;
  }

  get restaurantId(): string {
    return this.props.restaurantId.value;
  }

  get name(): string {
    return this.props.name.value;
  }

  get description(): string | null {
    return this.props.description.value;
  }

  get width(): number {
    return this.props.width.value;
  }

  get height(): number {
    return this.props.height.value;
  }

  update(data: SectionUpdate): void {
    const next: SectionProps = {
      restaurantId:
        data.restaurantId !== undefined
          ? new SectionRestaurantId(data.restaurantId)
          : this.props.restaurantId,
      name:
        data.name !== undefined ? new SectionName(data.name) : this.props.name,
      description:
        data.description !== undefined
          ? SectionDescription.create(data.description)
          : this.props.description,
      width:
        data.width !== undefined
          ? new SectionWidth(data.width)
          : this.props.width,
      height:
        data.height !== undefined
          ? new SectionHeight(data.height)
          : this.props.height,
    };

    this.props = next;
  }

  snapshot(): SectionSnapshot {
    return {
      id: this.internalId,
      restaurantId: this.props.restaurantId.value,
      name: this.props.name.value,
      description: this.props.description.value,
      width: this.props.width.value,
      height: this.props.height.value,
    };
  }
}
