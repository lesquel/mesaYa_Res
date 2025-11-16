import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantScheduleSlotOrmEntity } from '../orm/restaurant-schedule-slot.orm-entity';

export interface ScheduleSlotRecord {
  id: string;
  restaurantId: string;
  summary: string;
  day: string;
  open: string;
  close: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RestaurantScheduleSlotRepository {
  constructor(
    @InjectRepository(RestaurantScheduleSlotOrmEntity)
    private readonly repo: Repository<RestaurantScheduleSlotOrmEntity>,
  ) {}

  async create(payload: {
    restaurantId: string;
    summary: string;
    day: string;
    open: string;
    close: string;
  }): Promise<ScheduleSlotRecord> {
    const entity = this.repo.create({
      restaurantId: payload.restaurantId,
      summary: payload.summary,
      day: payload.day,
      openTime: payload.open,
      closeTime: payload.close,
    });
    const saved = await this.repo.save(entity);
    return this.mapRecord(saved);
  }

  async listByRestaurant(restaurantId: string): Promise<ScheduleSlotRecord[]> {
    const rows = await this.repo.find({
      where: { restaurantId },
      order: { day: 'ASC', openTime: 'ASC' },
    });
    return rows.map((row) => this.mapRecord(row));
  }

  async findById(id: string): Promise<ScheduleSlotRecord | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.mapRecord(entity) : null;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async hasOverlap(options: {
    restaurantId: string;
    day: string;
    open: string;
    close: string;
    excludeId?: string;
  }): Promise<boolean> {
    const qb = this.repo
      .createQueryBuilder('slot')
      .where('slot.restaurantId = :restaurantId', {
        restaurantId: options.restaurantId,
      })
      .andWhere('slot.day = :day', { day: options.day })
      .andWhere('NOT (:close <= slot.openTime OR :open >= slot.closeTime)', {
        open: options.open,
        close: options.close,
      });

    if (options.excludeId) {
      qb.andWhere('slot.id <> :excludeId', { excludeId: options.excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  private mapRecord(row: RestaurantScheduleSlotOrmEntity): ScheduleSlotRecord {
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      summary: row.summary,
      day: row.day,
      open: row.openTime,
      close: row.closeTime,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
