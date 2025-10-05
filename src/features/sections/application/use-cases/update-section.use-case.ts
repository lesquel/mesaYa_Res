import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { SectionMapper } from '../mappers/section.mapper.js';
import { SectionResponseDto } from '../dto/output/section.response.dto.js';
import { UpdateSectionCommand } from '../dto/input/update-section.dto.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/section-repository.port.js';
import {
  RESTAURANT_SECTION_READER,
  type RestaurantSectionReaderPort,
} from '../ports/restaurant-reader.port.js';
import { SectionNotFoundError } from '../../domain/errors/section-not-found.error.js';
import { SectionRestaurantNotFoundError } from '../../domain/errors/section-restaurant-not-found.error.js';
import { type UpdateSectionProps } from '../../domain/entities/section.entity.js';

@Injectable()
export class UpdateSectionUseCase
  implements UseCase<UpdateSectionCommand, SectionResponseDto>
{
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
    @Inject(RESTAURANT_SECTION_READER)
    private readonly restaurantReader: RestaurantSectionReaderPort,
  ) {}

  async execute(command: UpdateSectionCommand): Promise<SectionResponseDto> {
    const section = await this.sectionRepository.findById(command.sectionId);

    if (!section) {
      throw new SectionNotFoundError(command.sectionId);
    }

    if (
      command.restaurantId !== undefined &&
      command.restaurantId !== section.restaurantId
    ) {
      const exists = await this.restaurantReader.exists(command.restaurantId);
      if (!exists) {
        throw new SectionRestaurantNotFoundError(command.restaurantId);
      }
    }

    const updateData: UpdateSectionProps = {};

    if (command.name !== undefined) {
      updateData.name = command.name;
    }
    if (command.description !== undefined) {
      updateData.description = command.description;
    }
    if (command.restaurantId !== undefined) {
      updateData.restaurantId = command.restaurantId;
    }

    section.update(updateData);

    const saved = await this.sectionRepository.save(section);
    return SectionMapper.toResponse(saved);
  }
}
