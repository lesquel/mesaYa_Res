import { randomUUID } from 'node:crypto';
import {
  RestaurantCapacity,
  RestaurantDaysOpen,
  RestaurantDescription,
  RestaurantImageId,
  RestaurantLocation,
  RestaurantName,
  RestaurantOwnerId,
  RestaurantSchedule,
  RestaurantSubscriptionId,
  RestaurantStatus,
  type RestaurantStatusValue,
  RestaurantAdminNote,
  type RestaurantDay,
} from './values/index';
import type { SectionWithTablesSnapshot } from '@features/sections/domain/types';
import {
  type RestaurantCreate,
  type RestaurantSnapshot,
  type RestaurantUpdate,
} from '../types/index';
import type { RestaurantLocationSnapshot } from './values/restaurant-location';

interface RestaurantProps {
  name: RestaurantName;
  description: RestaurantDescription;
  location: RestaurantLocation;
  schedule: RestaurantSchedule;
  daysOpen: RestaurantDaysOpen;
  totalCapacity: RestaurantCapacity;
  subscriptionId: RestaurantSubscriptionId;
  imageId: RestaurantImageId;
  sections: SectionWithTablesSnapshot[];
  status: RestaurantStatus;
  adminNote: RestaurantAdminNote;
  active: boolean;
  ownerId: RestaurantOwnerId | null;
  createdAt: Date;
  updatedAt: Date;
  distanceKm?: number | null;
}

export class RestaurantEntity {
  private constructor(
    private props: RestaurantProps,
    private readonly internalId: string,
  ) {}

  static create(
    props: RestaurantCreate,
    id: string = randomUUID(),
  ): RestaurantEntity {
    const now = new Date();
    const status = RestaurantStatus.create(
      props.status ?? (props.active === false ? 'SUSPENDED' : 'ACTIVE'),
    );

    const aggregated: RestaurantProps = {
      name: new RestaurantName(props.name),
      description: RestaurantDescription.create(props.description ?? null),
      location: new RestaurantLocation(props.location),
      schedule: new RestaurantSchedule(props.openTime, props.closeTime),
      daysOpen: new RestaurantDaysOpen(props.daysOpen ?? []),
      totalCapacity: new RestaurantCapacity(props.totalCapacity),
      subscriptionId: new RestaurantSubscriptionId(props.subscriptionId),
      imageId: RestaurantImageId.create(props.imageId ?? null),
      status,
      adminNote: RestaurantAdminNote.create(props.adminNote ?? null),
      active: status.isActive(),
      ownerId: RestaurantOwnerId.create(props.ownerId),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      sections: props.sections ?? [],
      distanceKm: null,
    };

    return new RestaurantEntity(aggregated, id);
  }

  static rehydrate(snapshot: RestaurantSnapshot): RestaurantEntity {
    const aggregated: RestaurantProps = {
      name: new RestaurantName(snapshot.name),
      description: RestaurantDescription.create(snapshot.description),
      location: new RestaurantLocation(snapshot.location),
      schedule: new RestaurantSchedule(snapshot.openTime, snapshot.closeTime),
      daysOpen: new RestaurantDaysOpen(snapshot.daysOpen),
      totalCapacity: new RestaurantCapacity(snapshot.totalCapacity),
      subscriptionId: new RestaurantSubscriptionId(snapshot.subscriptionId),
      imageId: RestaurantImageId.create(snapshot.imageId),
      status: RestaurantStatus.create(
        snapshot.status ?? (snapshot.active ? 'ACTIVE' : 'SUSPENDED'),
      ),
      adminNote: RestaurantAdminNote.create(snapshot.adminNote ?? null),
      active: snapshot.active,
      ownerId: RestaurantOwnerId.fromNullable(snapshot.ownerId),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      sections: snapshot.sections ?? [],
      distanceKm: snapshot.distanceKm ?? null,
    };

    return new RestaurantEntity(aggregated, snapshot.id);
  }

  get id(): string {
    return this.internalId;
  }

  get name(): string {
    return this.props.name.value;
  }

  get description(): string | null {
    return this.props.description.value;
  }

  get location(): RestaurantLocationSnapshot {
    return this.props.location.value;
  }

  get locationLabel(): string {
    return this.props.location.label;
  }

  get openTime(): string {
    return this.props.schedule.openTime;
  }

  get closeTime(): string {
    return this.props.schedule.closeTime;
  }

  get daysOpen(): RestaurantDay[] {
    return this.props.daysOpen.value;
  }

  get totalCapacity(): number {
    return this.props.totalCapacity.value;
  }

  get subscriptionId(): string {
    return this.props.subscriptionId.value;
  }

  get imageId(): string | null {
    return this.props.imageId.value;
  }

  get status(): RestaurantStatusValue {
    return this.props.status.value;
  }

  get adminNote(): string | null {
    return this.props.adminNote.value;
  }

  get active(): boolean {
    return this.props.active;
  }

  get ownerId(): string | null {
    return this.props.ownerId?.value ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(data: RestaurantUpdate): void {
    const nextProps: RestaurantProps = {
      ...this.props,
      name:
        data.name !== undefined
          ? new RestaurantName(data.name)
          : this.props.name,
      description:
        data.description !== undefined
          ? RestaurantDescription.create(data.description)
          : this.props.description,
      location:
        data.location !== undefined
          ? new RestaurantLocation(data.location)
          : this.props.location,
      schedule:
        data.openTime !== undefined || data.closeTime !== undefined
          ? new RestaurantSchedule(
              data.openTime ?? this.props.schedule.openTime,
              data.closeTime ?? this.props.schedule.closeTime,
            )
          : this.props.schedule,
      daysOpen:
        data.daysOpen !== undefined
          ? new RestaurantDaysOpen(data.daysOpen)
          : this.props.daysOpen,
      totalCapacity:
        data.totalCapacity !== undefined
          ? new RestaurantCapacity(data.totalCapacity)
          : this.props.totalCapacity,
      subscriptionId:
        data.subscriptionId !== undefined
          ? new RestaurantSubscriptionId(data.subscriptionId)
          : this.props.subscriptionId,
      imageId:
        data.imageId !== undefined
          ? RestaurantImageId.create(data.imageId)
          : this.props.imageId,
      status:
        data.status !== undefined
          ? RestaurantStatus.create(data.status)
          : this.props.status,
      adminNote:
        data.adminNote !== undefined
          ? RestaurantAdminNote.create(data.adminNote)
          : this.props.adminNote,
      updatedAt: new Date(),
      sections: this.props.sections,
    };

    this.props = {
      ...nextProps,
      active: nextProps.status.isActive(),
    };
  }

  deactivate(): void {
    if (!this.props.active) {
      return;
    }

    this.props = {
      ...this.props,
      active: false,
      status: this.props.status.suspend(),
      updatedAt: new Date(),
    };
  }

  activate(): void {
    if (this.props.active) {
      return;
    }

    this.props = {
      ...this.props,
      active: true,
      status: this.props.status.activate(),
      updatedAt: new Date(),
    };
  }

  setStatus(status: RestaurantStatusValue, adminNote?: string | null): void {
    const nextStatus = RestaurantStatus.create(status);

    this.props = {
      ...this.props,
      status: nextStatus,
      adminNote: RestaurantAdminNote.create(adminNote ?? null),
      active: nextStatus.isActive(),
      updatedAt: new Date(),
    };
  }

  setComputedDistance(distanceKm: number | null | undefined): void {
    this.props = {
      ...this.props,
      distanceKm: distanceKm ?? null,
    };
  }

  archive(): void {
    this.props = {
      ...this.props,
      status: this.props.status.archive(),
      adminNote: this.props.adminNote,
      active: false,
      updatedAt: new Date(),
    };
  }

  transferOwnership(newOwnerId: string): void {
    const ownerId = RestaurantOwnerId.create(newOwnerId);

    this.props = {
      ...this.props,
      ownerId,
      updatedAt: new Date(),
    };
  }

  snapshot(): RestaurantSnapshot {
    return {
      id: this.internalId,
      name: this.props.name.value,
      description: this.props.description.value,
      location: this.props.location.value,
      openTime: this.props.schedule.openTime,
      closeTime: this.props.schedule.closeTime,
      daysOpen: this.props.daysOpen.value,
      totalCapacity: this.props.totalCapacity.value,
      subscriptionId: this.props.subscriptionId.value,
      imageId: this.props.imageId.value,
      active: this.props.active,
      status: this.props.status.value,
      adminNote: this.props.adminNote.value,
      ownerId: this.props.ownerId?.value ?? null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      sections: this.props.sections,
      distanceKm: this.props.distanceKm ?? null,
    };
  }
}
