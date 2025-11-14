import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantScheduleExceptionOrmEntity } from '../orm/restaurant-schedule-exception.orm-entity';

export interface ScheduleExceptionRecord {
  id: string;
  restaurantId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RestaurantScheduleExceptionRepository {
  constructor(
    @InjectRepository(RestaurantScheduleExceptionOrmEntity)
    private readonly repo: Repository<RestaurantScheduleExceptionOrmEntity>,
  ) {}

  async create(data: {
    restaurantId: string;
    startDate: string;
    endDate: string;
    reason?: string | null;
  }): Promise<ScheduleExceptionRecord> {
    const e = this.repo.create(data as any);
    const saved = await this.repo.save(e);
    return saved as unknown as ScheduleExceptionRecord;
  }

  async update(id: string, data: Partial<{ startDate: string; endDate: string; reason?: string | null }>): Promise<ScheduleExceptionRecord | null> {
    await this.repo.update({ id }, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async findById(id: string): Promise<ScheduleExceptionRecord | null> {
    const r = await this.repo.findOne({ where: { id } });
    return r ? (r as unknown as ScheduleExceptionRecord) : null;
  }

  async listByRestaurant(restaurantId: string): Promise<ScheduleExceptionRecord[]> {
    const rows = await this.repo.find({ where: { restaurantId }, order: { startDate: 'ASC' } });
    return rows as unknown as ScheduleExceptionRecord[];
  }

  async findOverlapping(restaurantId: string, startDate: string, endDate: string, excludeId?: string): Promise<ScheduleExceptionRecord[]> {
    const qb = this.repo.createQueryBuilder('e')
      .where('e.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('NOT (e.end_date < :startDate OR e.start_date > :endDate)', { startDate, endDate });

    if (excludeId) {
      qb.andWhere('e.id != :excludeId', { excludeId });
    }

    const rows = await qb.getMany();
    return rows as unknown as ScheduleExceptionRecord[];
  }
}
