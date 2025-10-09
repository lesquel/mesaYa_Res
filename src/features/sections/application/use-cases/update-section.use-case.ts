import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { SectionMapper } from '../mappers/index.js';
import { SectionResponseDto, UpdateSectionCommand } from '../dto/index.js';
import {
  RESTAURANT_SECTION_READER,
  SECTION_REPOSITORY,
  type RestaurantSectionReaderPort,
  type SectionRepositoryPort,
} from '../ports/index.js';
import {
  SectionNotFoundError,
  SectionRestaurantNotFoundError,
  type SectionUpdate,
} from '../../domain/index.js';

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

  const updateData: SectionUpdate = {};

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
