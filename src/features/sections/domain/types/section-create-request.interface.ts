export interface SectionCreateRequest {
  restaurantId: string;
  name: string;
  description?: string | null;
  width: number;
  height: number;
}
