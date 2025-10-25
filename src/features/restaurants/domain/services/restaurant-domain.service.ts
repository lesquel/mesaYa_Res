import { RestaurantEntity } from '../entities/restaurant.entity';
import {
  RestaurantNotFoundError,
  RestaurantOwnerNotFoundError,
  RestaurantOwnershipError,
} from '../errors';
import { IRestaurantDomainRepositoryPort } from '../repositories/restaurant-domain-repository.port';
import { IRestaurantOwnerPort } from '../ports/restaurant-owner.port';
import {
  type RestaurantCreateRequest,
  type RestaurantDeleteRequest,
  type RestaurantUpdateRequest,
} from '../types/restaurant-domain.types';
import type { RestaurantUpdate } from '../types/restaurant-update.type';

export class RestaurantDomainService {
  constructor(
    private readonly restaurantRepository: IRestaurantDomainRepositoryPort,
    private readonly ownerPort: IRestaurantOwnerPort,
  ) {}

  async createRestaurant(
    request: RestaurantCreateRequest,
  ): Promise<RestaurantEntity> {
    const ownerId = this.normalizeId(request.ownerId);
    await this.ensureOwner(ownerId);

    const restaurant = RestaurantEntity.create({
      ownerId,
      name: request.name,
      description: request.description ?? null,
      location: request.location,
      openTime: request.openTime,
      closeTime: request.closeTime,
      daysOpen: request.daysOpen,
      totalCapacity: request.totalCapacity,
      subscriptionId: request.subscriptionId,
      imageId: request.imageId ?? null,
      active: request.active ?? true,
    });

    return this.restaurantRepository.save(restaurant);
  }

  async updateRestaurant(
    request: RestaurantUpdateRequest,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.ensureRestaurant(request.restaurantId);
    const ownerId = this.normalizeId(request.ownerId);
    this.ensureOwnership(restaurant, ownerId);

    const updatePayload: RestaurantUpdate = {
      id: request.restaurantId,
      name: request.name,
      description: request.description,
      location: request.location,
      openTime: request.openTime,
      closeTime: request.closeTime,
      daysOpen: request.daysOpen,
      totalCapacity: request.totalCapacity,
      subscriptionId: request.subscriptionId,
      imageId: request.imageId,
    };

    restaurant.update(updatePayload);

    return this.restaurantRepository.save(restaurant);
  }

  async deleteRestaurant(
    request: RestaurantDeleteRequest,
  ): Promise<RestaurantEntity> {
    const restaurant = await this.ensureRestaurant(request.restaurantId);
    const ownerId = this.normalizeId(request.ownerId);
    this.ensureOwnership(restaurant, ownerId);

    await this.restaurantRepository.delete(restaurant.id);

    return restaurant;
  }

  private async ensureOwner(ownerId: string): Promise<void> {
    const exists = await this.ownerPort.exists(ownerId);
    if (!exists) {
      throw new RestaurantOwnerNotFoundError(ownerId);
    }
  }

  private async ensureRestaurant(
    restaurantId: string,
  ): Promise<RestaurantEntity> {
    const normalizedId = this.normalizeId(restaurantId);
    const restaurant = await this.restaurantRepository.findById(normalizedId);
    if (!restaurant) {
      throw new RestaurantNotFoundError(normalizedId);
    }
    return restaurant;
  }

  private ensureOwnership(restaurant: RestaurantEntity, ownerId: string): void {
    if (restaurant.ownerId !== ownerId) {
      throw new RestaurantOwnershipError();
    }
  }

  private normalizeId(value: string): string {
    return value.trim();
  }
}
