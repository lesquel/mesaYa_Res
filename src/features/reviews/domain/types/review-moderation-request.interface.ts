export interface ReviewModerationRequest {
  reviewId: string;
  rating?: number;
  comment?: string | null;
  hideComment?: boolean;
}
