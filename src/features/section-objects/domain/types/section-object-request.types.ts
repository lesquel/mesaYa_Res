export interface SectionObjectCreateRequest {
  sectionObjectId: string;
  sectionId: string;
  objectId: string;
}

export interface SectionObjectUpdateRequest {
  sectionObjectId: string;
  sectionId?: string;
  objectId?: string;
}

export interface SectionObjectDeleteRequest {
  sectionObjectId: string;
}
