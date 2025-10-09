import { randomUUID } from 'node:crypto';
import {
  SectionDescription,
  SectionName,
  SectionRestaurantId,
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
    };

    return new Section(aggregated, id);
  }

  static rehydrate(snapshot: SectionSnapshot): Section {
    const aggregated: SectionProps = {
      restaurantId: new SectionRestaurantId(snapshot.restaurantId),
      name: new SectionName(snapshot.name),
      description: SectionDescription.create(snapshot.description),
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
    };

    this.props = next;
  }

  snapshot(): SectionSnapshot {
    return {
      id: this.internalId,
      restaurantId: this.props.restaurantId.value,
      name: this.props.name.value,
      description: this.props.description.value,
    };
  }
}
