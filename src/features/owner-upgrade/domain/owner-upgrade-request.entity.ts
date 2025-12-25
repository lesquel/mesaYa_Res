import { randomUUID } from 'crypto';
import { OwnerUpgradeRequestStatus } from './enums';
import type {
  CreateOwnerUpgradeRequestProps,
  OwnerUpgradeRequestProps,
} from './types';

// Re-export for backward compatibility
export type { OwnerUpgradeRequestProps } from './types';

export class OwnerUpgradeRequestEntity {
  private readonly idValue: string;
  private readonly userIdValue: string;
  private restaurantNameValue: string;
  private restaurantLocationValue: string;
  private restaurantDescriptionValue: string | null;
  private preferredSubscriptionPlanIdValue: string | null;
  private statusValue: OwnerUpgradeRequestStatus;
  private userNoteValue: string | null;
  private adminNoteValue: string | null;
  private assignedRestaurantIdValue: string | null;
  private processedByValue: string | null;
  private processedAtValue: Date | null;
  private createdAtValue: Date;
  private updatedAtValue: Date;

  private constructor(props: OwnerUpgradeRequestProps) {
    this.idValue = props.id ?? randomUUID();
    this.userIdValue = props.userId;
    this.restaurantNameValue = props.restaurantName;
    this.restaurantLocationValue = props.restaurantLocation;
    this.restaurantDescriptionValue = props.restaurantDescription ?? null;
    this.preferredSubscriptionPlanIdValue =
      props.preferredSubscriptionPlanId ?? null;
    this.statusValue = props.status ?? OwnerUpgradeRequestStatus.PENDING;
    this.userNoteValue = props.userNote ?? null;
    this.adminNoteValue = props.adminNote ?? null;
    this.assignedRestaurantIdValue = props.assignedRestaurantId ?? null;
    this.processedByValue = props.processedBy ?? null;
    this.processedAtValue = props.processedAt ?? null;
    this.createdAtValue = props.createdAt ?? new Date();
    this.updatedAtValue = props.updatedAt ?? new Date();
  }

  static create(
    props: CreateOwnerUpgradeRequestProps,
  ): OwnerUpgradeRequestEntity {
    return new OwnerUpgradeRequestEntity({
      ...props,
      status: OwnerUpgradeRequestStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static rehydrate(props: OwnerUpgradeRequestProps): OwnerUpgradeRequestEntity {
    return new OwnerUpgradeRequestEntity({
      ...props,
      status: props.status ?? OwnerUpgradeRequestStatus.PENDING,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get requestId(): string {
    return this.idValue;
  }

  get userId(): string {
    return this.userIdValue;
  }

  get restaurantName(): string {
    return this.restaurantNameValue;
  }

  get restaurantLocation(): string {
    return this.restaurantLocationValue;
  }

  get restaurantDescription(): string | null {
    return this.restaurantDescriptionValue;
  }

  get preferredSubscriptionPlanId(): string | null {
    return this.preferredSubscriptionPlanIdValue;
  }

  get status(): OwnerUpgradeRequestStatus {
    return this.statusValue;
  }

  get userNote(): string | null {
    return this.userNoteValue;
  }

  get adminNote(): string | null {
    return this.adminNoteValue;
  }

  get assignedRestaurantId(): string | null {
    return this.assignedRestaurantIdValue;
  }

  get processedBy(): string | null {
    return this.processedByValue;
  }

  get processedAt(): Date | null {
    return this.processedAtValue;
  }

  get createdAt(): Date {
    return this.createdAtValue;
  }

  get updatedAt(): Date {
    return this.updatedAtValue;
  }

  approve(options: {
    restaurantId: string;
    adminId: string;
    adminNote?: string | null;
  }): void {
    this.ensurePending();
    this.statusValue = OwnerUpgradeRequestStatus.APPROVED;
    this.assignedRestaurantIdValue = options.restaurantId;
    this.processedByValue = options.adminId;
    this.processedAtValue = new Date();
    this.adminNoteValue = options.adminNote ?? null;
    this.updatedAtValue = new Date();
  }

  reject(options: { adminId: string; adminNote?: string | null }): void {
    this.ensurePending();
    this.statusValue = OwnerUpgradeRequestStatus.REJECTED;
    this.processedByValue = options.adminId;
    this.processedAtValue = new Date();
    this.adminNoteValue = options.adminNote ?? null;
    this.assignedRestaurantIdValue = null;
    this.updatedAtValue = new Date();
  }

  private ensurePending(): void {
    if (this.statusValue !== OwnerUpgradeRequestStatus.PENDING) {
      throw new Error('Owner upgrade request already processed');
    }
  }

  snapshot(): OwnerUpgradeRequestProps {
    return {
      id: this.idValue,
      userId: this.userIdValue,
      restaurantName: this.restaurantNameValue,
      restaurantLocation: this.restaurantLocationValue,
      restaurantDescription: this.restaurantDescriptionValue,
      preferredSubscriptionPlanId: this.preferredSubscriptionPlanIdValue,
      status: this.statusValue,
      userNote: this.userNoteValue,
      adminNote: this.adminNoteValue,
      assignedRestaurantId: this.assignedRestaurantIdValue,
      processedBy: this.processedByValue,
      processedAt: this.processedAtValue,
      createdAt: this.createdAtValue,
      updatedAt: this.updatedAtValue,
    };
  }
}
