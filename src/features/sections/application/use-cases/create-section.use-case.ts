import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/ports/use-case.port.js';
import { Section, SectionRestaurantNotFoundError } from '../../domain/index.js';
import { SectionMapper } from '../mappers/index.js';
import { SectionResponseDto, CreateSectionCommand } from '../dto/index.js';
import {
  RESTAURANT_SECTION_READER,
  SECTION_REPOSITORY,
  type RestaurantSectionReaderPort,
  type SectionRepositoryPort,
} from '../ports/index.js';

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
