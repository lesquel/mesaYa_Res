import { Section } from '../entities/section.entity';
import {
  SectionNameConflictError,
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
} from '../errors';
import { ISectionDomainRepositoryPort } from '../repositories';
import {
  ISectionRestaurantPort,
  type SectionRestaurantSnapshot,
} from '../ports';
import {
  type SectionCreateRequest,
  type SectionDeleteRequest,
  type SectionUpdateRequest,
} from '../types';

export class SectionDomainService {
  constructor(
    private readonly sectionRepository: ISectionDomainRepositoryPort,
    private readonly restaurantPort: ISectionRestaurantPort,
  ) {}

  async createSection(request: SectionCreateRequest): Promise<Section> {
    const restaurant = await this.ensureRestaurant(request.restaurantId);

    const section = Section.create({
      restaurantId: restaurant.restaurantId,
      name: request.name,
      description: request.description ?? null,
      width: request.width,
      height: request.height,
    });

    await this.ensureUniqueName(section.restaurantId, section.name);

    return this.sectionRepository.save(section);
  }

  async updateSection(request: SectionUpdateRequest): Promise<Section> {
    const existing = await this.ensureSection(request.sectionId);

    const currentSnapshot = existing.snapshot();

    const nextRestaurantId =
      request.restaurantId !== undefined
        ? this.normalizeId(request.restaurantId)
        : currentSnapshot.restaurantId;

    await this.ensureRestaurant(nextRestaurantId);

    const candidateSnapshot = {
      ...currentSnapshot,
      restaurantId: nextRestaurantId,
      name: request.name ?? currentSnapshot.name,
      description:
        request.description !== undefined
          ? (request.description ?? null)
          : currentSnapshot.description,
      width: request.width ?? currentSnapshot.width,
      height: request.height ?? currentSnapshot.height,
    };

    const candidate = Section.rehydrate(candidateSnapshot);

    await this.ensureUniqueName(
      candidate.restaurantId,
      candidate.name,
      candidate.id,
    );

    existing.update({
      restaurantId:
        request.restaurantId !== undefined &&
        candidateSnapshot.restaurantId !== currentSnapshot.restaurantId
          ? candidateSnapshot.restaurantId
          : undefined,
      name: request.name !== undefined ? candidateSnapshot.name : undefined,
      description:
        request.description !== undefined
          ? candidateSnapshot.description
          : undefined,
      width: request.width !== undefined ? candidateSnapshot.width : undefined,
      height:
        request.height !== undefined ? candidateSnapshot.height : undefined,
    });

    return this.sectionRepository.save(existing);
  }

  async deleteSection(request: SectionDeleteRequest): Promise<Section> {
    const existing = await this.ensureSection(request.sectionId);
    await this.sectionRepository.delete(existing.id);
    return existing;
  }

  private async ensureSection(sectionId: string): Promise<Section> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) {
      throw new SectionNotFoundError(sectionId);
    }
    return section;
  }

  private async ensureRestaurant(
    restaurantId: string,
  ): Promise<SectionRestaurantSnapshot> {
    const normalized = this.normalizeId(restaurantId);
    const restaurant = await this.restaurantPort.loadById(normalized);
    if (!restaurant) {
      throw new SectionRestaurantNotFoundError(normalized);
    }
    return restaurant;
  }

  private async ensureUniqueName(
    restaurantId: string,
    name: string,
    excludeSectionId?: string,
  ): Promise<void> {
    const normalizedName = name.trim();
    const existing = await this.sectionRepository.findByRestaurantAndName(
      restaurantId,
      normalizedName,
    );

    if (existing && existing.id !== excludeSectionId) {
      throw new SectionNameConflictError(restaurantId, normalizedName);
    }
  }

  private normalizeId(value: string): string {
    return value.trim();
  }
}
