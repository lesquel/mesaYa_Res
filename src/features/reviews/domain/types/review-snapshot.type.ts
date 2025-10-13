export interface ReviewSnapshot {
  id: string;
  restaurantId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
