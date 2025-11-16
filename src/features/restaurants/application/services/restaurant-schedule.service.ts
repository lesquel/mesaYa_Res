import { Injectable } from '@nestjs/common';
import { RestaurantScheduleExceptionRepository } from '@features/restaurants/infrastructure/database/typeorm/repositories/restaurant-schedule-exception.repository';
import { RestaurantScheduleSlotRepository } from '@features/restaurants/infrastructure/database/typeorm/repositories/restaurant-schedule-slot.repository';
import { RestaurantsService } from '@features/restaurants/application/services';

const VALID_WEEKDAYS = new Set([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

@Injectable()
export class RestaurantScheduleService {
  constructor(
    private readonly exceptionsRepo: RestaurantScheduleExceptionRepository,
    private readonly slotsRepo: RestaurantScheduleSlotRepository,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async createException(
    restaurantId: string,
    ownerId: string,
    payload: { startDate: string; endDate: string; reason?: string },
  ) {
    await this.ensureOwnership(restaurantId, ownerId);

    // check overlaps
    const overlapping = await this.exceptionsRepo.findOverlapping(
      restaurantId,
      payload.startDate,
      payload.endDate,
    );
    if (overlapping.length > 0) {
      throw new Error('Schedule exception overlaps with existing exception');
    }

    return this.exceptionsRepo.create({ restaurantId, ...payload });
  }

  async updateException(
    restaurantId: string,
    ownerId: string,
    id: string,
    payload: { startDate?: string; endDate?: string; reason?: string | null },
  ) {
    await this.ensureOwnership(restaurantId, ownerId);

    // compute new dates for overlap check
    const existing = await this.exceptionsRepo.findById(id);
    if (!existing) throw new Error('Schedule exception not found');
    const startDate = payload.startDate ?? existing.startDate;
    const endDate = payload.endDate ?? existing.endDate;

    const overlapping = await this.exceptionsRepo.findOverlapping(
      restaurantId,
      startDate,
      endDate,
      id,
    );
    if (overlapping.length > 0) {
      throw new Error('Schedule exception overlaps with existing exception');
    }

    return this.exceptionsRepo.update(id, payload);
  }

  async deleteException(restaurantId: string, ownerId: string, id: string) {
    await this.ensureOwnership(restaurantId, ownerId);

    await this.exceptionsRepo.delete(id);
  }

  async listExceptions(restaurantId: string, ownerId: string) {
    await this.ensureOwnership(restaurantId, ownerId);

    return this.exceptionsRepo.listByRestaurant(restaurantId);
  }

  async listSlots(restaurantId: string, ownerId: string) {
    await this.ensureOwnership(restaurantId, ownerId);
    return this.slotsRepo.listByRestaurant(restaurantId);
  }

  async createSlot(
    restaurantId: string,
    ownerId: string,
    payload: { summary: string; day: string; open: string; close: string },
  ) {
    await this.ensureOwnership(restaurantId, ownerId);

    const normalized = this.normalizeSlotPayload(payload);

    const overlaps = await this.slotsRepo.hasOverlap({
      restaurantId,
      day: normalized.day,
      open: normalized.open,
      close: normalized.close,
    });
    if (overlaps) {
      throw new Error('Schedule slot overlaps with an existing slot');
    }

    return this.slotsRepo.create({ restaurantId, ...normalized });
  }

  async deleteSlot(restaurantId: string, ownerId: string, id: string) {
    await this.ensureOwnership(restaurantId, ownerId);
    const slot = await this.slotsRepo.findById(id);
    if (!slot || slot.restaurantId !== restaurantId) {
      throw new Error('Schedule slot not found');
    }
    await this.slotsRepo.remove(id);
  }

  private async ensureOwnership(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantsService.findOne({ restaurantId });
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }
  }

  private normalizeSlotPayload(payload: {
    summary: string;
    day: string;
    open: string;
    close: string;
  }) {
    const day = this.normalizeWeekday(payload.day);
    const open = (payload.open ?? '').trim();
    const close = (payload.close ?? '').trim();
    if (!open || !close || open >= close) {
      throw new Error('Schedule slot has invalid time range');
    }
    const summary = (payload.summary ?? '').trim() || 'Shift';
    return { summary, day, open, close };
  }

  private normalizeWeekday(value: string): string {
    const normalized = (value ?? '').toLowerCase();
    if (!VALID_WEEKDAYS.has(normalized)) {
      throw new Error('Invalid weekday value');
    }
    return normalized;
  }
}
