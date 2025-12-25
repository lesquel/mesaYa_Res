import type { OwnerUpgradeRequestStatus } from '../enums';

export interface OwnerUpgradeRequestProps {
  id?: string | null;
  userId: string;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription?: string | null;
  preferredSubscriptionPlanId?: string | null;
  status?: OwnerUpgradeRequestStatus;
  userNote?: string | null;
  adminNote?: string | null;
  assignedRestaurantId?: string | null;
  processedBy?: string | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnerUpgradeRequestSnapshot {
  id: string;
  userId: string;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription: string | null;
  preferredSubscriptionPlanId: string | null;
  status: OwnerUpgradeRequestStatus;
  userNote: string | null;
  adminNote: string | null;
  assignedRestaurantId: string | null;
  processedBy: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOwnerUpgradeRequestProps {
  userId: string;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription?: string | null;
  preferredSubscriptionPlanId?: string | null;
  userNote?: string | null;
}
