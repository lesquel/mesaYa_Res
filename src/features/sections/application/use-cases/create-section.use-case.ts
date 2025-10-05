import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared/core/use-case.js';
import { Section } from '../../domain/entities/section.entity.js';
import { SectionMapper } from '../mappers/section.mapper.js';
import { SectionResponseDto } from '../dto/output/section.response.dto.js';
import { CreateSectionCommand } from '../dto/input/create-section.dto.js';
import {
  SECTION_REPOSITORY,
  type SectionRepositoryPort,
} from '../ports/section-repository.port.js';
import {
  RESTAURANT_SECTION_READER,
  type RestaurantSectionReaderPort,
} from '../ports/restaurant-reader.port.js';
import { SectionRestaurantNotFoundError } from '../../domain/errors/section-restaurant-not-found.error.js';

@Injectable()
export class CreateSectionUseCase
  implements UseCase<CreateSectionCommand, SectionResponseDto>
{
  constructor(
    @Inject(SECTION_REPOSITORY)
    private readonly sectionRepository: SectionRepositoryPort,
    @Inject(RESTAURANT_SECTION_READER)
    private readonly restaurantReader: RestaurantSectionReaderPort,
  ) {}

  async execute(command: CreateSectionCommand): Promise<SectionResponseDto> {
    const restaurantExists = await this.restaurantReader.exists(
      command.restaurantId,
    );

    if (!restaurantExists) {
      throw new SectionRestaurantNotFoundError(command.restaurantId);
    }

    const section = Section.create({
      restaurantId: command.restaurantId,
      name: command.name,
      description: command.description ?? null,
    });

    const saved = await this.sectionRepository.save(section);
    return SectionMapper.toResponse(saved);
  }
}
