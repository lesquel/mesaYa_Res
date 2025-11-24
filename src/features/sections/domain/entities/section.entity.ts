import { randomUUID } from 'node:crypto';
import {
  SectionDescription,
  SectionHeight,
  SectionName,
  SectionRestaurantId,
  SectionWidth,
} from './values';
import {
  type SectionCreate,
  type SectionSnapshot,
  type SectionUpdate,
} from '../types';
import type {
  SectionLayoutMetadata,
  SectionStatus,
} from '../types/section-layout-metadata.type';
import type { TableSnapshot } from '@features/tables/domain/entities/table.entity';

interface SectionProps {
  restaurantId: SectionRestaurantId;
  name: SectionName;
  description: SectionDescription;
  width: SectionWidth;
  height: SectionHeight;
  posX: number;
  posY: number;
  status: SectionStatus;
  layoutMetadata: SectionLayoutMetadata;
  tables?: TableSnapshot[];
  createdAt?: Date;
  updatedAt?: Date;
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
      posX: props.posX ?? 0,
      posY: props.posY ?? 0,
      status: props.status ?? 'ACTIVE',
      layoutMetadata: Section.defaultLayoutMetadata(props.layoutMetadata),
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
      posX: snapshot.posX,
      posY: snapshot.posY,
      status: snapshot.status,
      layoutMetadata: snapshot.layoutMetadata,
      tables: snapshot.tables,
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

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
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
      posX: data.posX !== undefined ? data.posX : this.props.posX,
      posY: data.posY !== undefined ? data.posY : this.props.posY,
      status: data.status !== undefined ? data.status : this.props.status,
      layoutMetadata:
        data.layoutMetadata !== undefined
          ? Section.mergeLayoutMetadata(
              this.props.layoutMetadata,
              data.layoutMetadata,
            )
          : this.props.layoutMetadata,
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
      posX: this.props.posX,
      posY: this.props.posY,
      status: this.props.status,
      layoutMetadata: this.props.layoutMetadata,
      tables: this.props.tables,
      createdAt: this.props.createdAt ?? new Date(),
      updatedAt: this.props.updatedAt ?? new Date(),
    };
  }

  get posX(): number {
    return this.props.posX;
  }

  get posY(): number {
    return this.props.posY;
  }

  get status(): SectionStatus {
    return this.props.status;
  }

  get layoutMetadata(): SectionLayoutMetadata {
    return this.props.layoutMetadata;
  }

  private static defaultLayoutMetadata(
    metadata?: SectionLayoutMetadata,
  ): SectionLayoutMetadata {
    return {
      layoutId: metadata?.layoutId ?? null,
      orientation: metadata?.orientation ?? 'LANDSCAPE',
      zIndex: metadata?.zIndex ?? 0,
      notes: metadata?.notes ?? null,
    };
  }

  private static mergeLayoutMetadata(
    current: SectionLayoutMetadata,
    next: SectionLayoutMetadata,
  ): SectionLayoutMetadata {
    return {
      layoutId: next.layoutId ?? current.layoutId,
      orientation: next.orientation ?? current.orientation,
      zIndex: next.zIndex ?? current.zIndex,
      notes: next.notes ?? current.notes,
    };
  }
}
