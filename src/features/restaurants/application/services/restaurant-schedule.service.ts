import { Injectable } from '@nestjs/common';
import { RestaurantScheduleExceptionRepository } from '@features/restaurants/infrastructure/database/typeorm/repositories/restaurant-schedule-exception.repository';
import { RestaurantsService } from '@features/restaurants/application/services';

@Injectable()
export class RestaurantScheduleService {
  constructor(
    private readonly repo: RestaurantScheduleExceptionRepository,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async createException(
    restaurantId: string,
    ownerId: string,
    payload: { startDate: string; endDate: string; reason?: string },
  ) {
    const restaurant = await this.restaurantsService.findOne({ restaurantId });
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }

    // check overlaps
    const overlapping = await this.repo.findOverlapping(
      restaurantId,
      payload.startDate,
      payload.endDate,
    );
    if (overlapping.length > 0) {
      throw new Error('Schedule exception overlaps with existing exception');
    }

    return this.repo.create({ restaurantId, ...payload });
  }

  async updateException(
    restaurantId: string,
    ownerId: string,
    id: string,
    payload: { startDate?: string; endDate?: string; reason?: string | null },
  ) {
    const restaurant = await this.restaurantsService.findOne({ restaurantId });
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }

    // compute new dates for overlap check
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('Schedule exception not found');
    const startDate = payload.startDate ?? existing.startDate;
    const endDate = payload.endDate ?? existing.endDate;

    const overlapping = await this.repo.findOverlapping(
      restaurantId,
      startDate,
      endDate,
      id,
    );
    if (overlapping.length > 0) {
      throw new Error('Schedule exception overlaps with existing exception');
    }

    return this.repo.update(id, payload);
  }

  async deleteException(restaurantId: string, ownerId: string, id: string) {
    const restaurant = await this.restaurantsService.findOne({ restaurantId });
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }

    await this.repo.delete(id);
  }

  async listExceptions(restaurantId: string, ownerId: string) {
    const restaurant = await this.restaurantsService.findOne({ restaurantId });
    if (restaurant.ownerId !== ownerId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }

    return this.repo.listByRestaurant(restaurantId);
  }
}
