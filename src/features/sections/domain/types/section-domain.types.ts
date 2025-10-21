export interface SectionCreateRequest {
  restaurantId: string;
  name: string;
  description?: string | null;
  width: number;
  height: number;
}

export interface SectionUpdateRequest {
  sectionId: string;
  restaurantId?: string;
  name?: string;
  description?: string | null;
  width?: number;
  height?: number;
}

export interface SectionDeleteRequest {
  sectionId: string;
}
