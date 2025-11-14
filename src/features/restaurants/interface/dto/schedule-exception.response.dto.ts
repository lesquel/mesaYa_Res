export class ScheduleExceptionResponseDto {
  id: string;
  restaurantId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromRecord(r: any): ScheduleExceptionResponseDto {
    return {
      id: r.id,
      restaurantId: r.restaurantId,
      startDate: r.startDate,
      endDate: r.endDate,
      reason: r.reason ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
