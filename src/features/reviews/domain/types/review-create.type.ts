export interface ReviewCreate {
  restaurantId: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  rating: number;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
