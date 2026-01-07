import { SentimentType } from '../enums';

export interface SentimentSnapshot {
  type: SentimentType;
  confidence: number;
  keywords: string[];
  analyzedAt: Date;
}

export interface ReviewSnapshot {
  id: string;
  restaurantId: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  rating: number;
  comment: string | null;
  sentiment?: SentimentSnapshot | null;
  createdAt: Date;
  updatedAt: Date;
}
