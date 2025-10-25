export interface GraphicObjectAnalyticsQuery {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly imageId?: string;
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}
