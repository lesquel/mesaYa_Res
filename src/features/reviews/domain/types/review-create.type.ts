export interface ReviewCreate {
  restaurantId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
